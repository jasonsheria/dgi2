import React, { useState, useEffect, useRef } from 'react';
import PMEDetailModal from '../components/PMEDetailModal';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { downloadFileFromPath } from '../utils/downloadFile';
import { useSnackbar } from 'notistack';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DashboardInspecteur = ({ user }) => {
  const [declarations, setDeclarations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  // Animation de chargement
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 800); // Simule un chargement
  }, []);
  // Sidebar responsive
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('pmeDeclarations') || '[]');
    setDeclarations(data);
  }, []);

  // Filtrage PME par recherche
  const filtered = declarations.filter(d =>
    d.nomEntreprise && d.nomEntreprise.toLowerCase().includes(search.toLowerCase())
  );

  // Statistiques pour graphiques
  const statusCount = declarations.reduce((acc, d) => {
    acc[d.validation] = (acc[d.validation] || 0) + 1;
    return acc;
  }, {});
  const monthCount = declarations.reduce((acc, d) => {
    const m = d.dateSoumission ? d.dateSoumission.slice(0,7) : 'Inconnu';
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  // Histogramme chiffre d'affaires
  const caLabels = declarations.map(d => d.nomEntreprise || 'PME');
  const caData = declarations.map(d => parseFloat(d.chiffreAffaires) || 0);
  // Histogramme charges
  const chargesData = declarations.map(d => parseFloat(d.charges) || 0);
  // Histogramme par statut
  const statusLabels = Object.keys(statusCount);
  const statusData = Object.values(statusCount);

  // Carnet des tâches (non persistant)
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const addTask = () => {
    if (taskInput.trim()) setTasks([...tasks, { text: taskInput, done: false }]);
    setTaskInput('');
  };
  const toggleTask = idx => setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  const removeTask = idx => setTasks(tasks.filter((_, i) => i !== idx));

  // Zone de conversation (non persistante)
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const sendMsg = () => {
    if (msgInput.trim()) setMessages([...messages, { from: 'Inspecteur', text: msgInput, date: new Date().toLocaleTimeString() }]);
    setMsgInput('');
  };

  const { enqueueSnackbar } = useSnackbar();

  // Listen for file download events from PMEDetailModal
  useEffect(() => {
    const handler = async (e) => {
      const path = e.detail;
      const file = selected?.files && Object.values(selected.files).find(f => f && f.path === path);
      if (file) await downloadFileFromPath(file.path, file.name);
    };
    window.addEventListener('download-pme-file', handler);
    return () => window.removeEventListener('download-pme-file', handler);
  }, [selected]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(180deg, #eaf3fa 0%, #c9e0f3 100%)', transition: 'background 0.4s' }}>
      {/* Sidebar responsive */}
      <aside ref={sidebarRef} style={{
        width: sidebarOpen ? 230 : 0,
        background: '#e3f0fa',
        borderRight: sidebarOpen ? '1px solid #d0e2f2' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: sidebarOpen ? '32px 0 0 0' : 0,
        maxHeight: "92vh",
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        transition: 'width 0.4s cubic-bezier(.4,2,.6,1), padding 0.3s',
        boxShadow: sidebarOpen ? '2px 0 12px #e3eafc' : 'none',
        zIndex: 20
      }}>
        {sidebarOpen && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, transition: 'opacity 0.3s' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#bfc9d1', marginBottom: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #c9e0f3' }}>
                <span style={{ fontSize: 38, color: '#fff', fontWeight: 700 }}>{user?.username?.[0]?.toUpperCase() || 'I'}</span>
              </div>
              <div style={{ fontWeight: 700, color: '#003366', fontSize: 18 }}>{user?.username || 'Inspecteur'}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{user?.email || 'inspecteur@dgi.gov'}</div>
            </div>
            <nav style={{ width: '100%' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
                {['Dashboard','PME','Reporting','Support','Paramètres'].map((item, idx) => (
                  <li key={item} style={{ margin: '12px 0' }}>
                    <button style={{ ...sidebarBtnStyle, transition: 'background 0.2s, color 0.2s', background: 'none', border: 'none', color: '#2a4d6c', fontWeight: 600, fontSize: 16, textAlign: 'left', cursor: 'pointer' }}
                      onMouseOver={e => e.currentTarget.style.background='#d0e2f2'}
                      onMouseOut={e => e.currentTarget.style.background='none'}
                    >{item}</button>
                  </li>
                ))}
              </ul>
            </nav>
            <button style={{ marginTop: 'auto', marginBottom: 32, background: 'none', border: 'none', color: '#e74c3c', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color='#c0392b'}
              onMouseOut={e => e.currentTarget.style.color='#e74c3c'}
            >⎋ Déconnexion</button>
          </>
        )}
      </aside>
      {/* Hamburger bouton */}
      <button onClick={()=>setSidebarOpen(o=>!o)} aria-label="Ouvrir/fermer menu" style={{
        position: 'fixed', left: sidebarOpen ? 210 : 0, top: 46, zIndex: 30, background: '#fff', border: '1px solid #e3eafc', borderRadius: 7, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #e3eafc', cursor: 'pointer', transition: 'left 0.4s', outline: 'none',
        opacity: 0.95
      }}>
        <span style={{ display: 'block', width: 22, height: 3, background: '#3498db', borderRadius: 2, marginBottom: 4, transition: 'transform 0.3s', transform: sidebarOpen ? 'rotate(0)' : 'rotate(45deg)' }}></span>
        <span style={{ display: 'block', width: 22, height: 3, background: '#3498db', borderRadius: 2, marginBottom: 4, transition: 'opacity 0.3s', opacity: sidebarOpen ? 1 : 0 }}></span>
        <span style={{ display: 'block', width: 22, height: 3, background: '#3498db', borderRadius: 2, transition: 'transform 0.3s', transform: sidebarOpen ? 'rotate(0)' : 'rotate(-45deg)' }}></span>
      </button>
      {/* Main content */}
      <main style={{ flex: 1, padding: '0 0 0 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'margin 0.4s' }}>
        {/* Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e3eafc', padding: '18px 36px 12px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 8px #e3eafc', transition: 'box-shadow 0.3s' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2a4d6c', letterSpacing: 0.5 }}>Bienvenue {user?.username || 'Inspecteur'} !</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <input type="text" placeholder="Recherche..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 8, borderRadius: 7, border: '1px solid #e3eafc', fontSize: 15, background: '#f7f8fa', minWidth: 180, transition: 'box-shadow 0.2s' }} />
            <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#bfc9d1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#3498db'} onMouseOut={e=>e.currentTarget.style.color='#bfc9d1'}>🔔</button>
            <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#bfc9d1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#3498db'} onMouseOut={e=>e.currentTarget.style.color='#bfc9d1'}>⚙️</button>
          </div>
        </header>
        {/* Stat cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 18, margin: '32px 36px 0 36px' }}>
          <StatCard label="Déclarations PME" value={declarations.length} icon="📄" color="#3498db" />
          <StatCard label="Total CA" value={caData.reduce((a,b)=>a+b,0).toLocaleString()} icon="💰" color="#8e44ad" />
          <StatCard label="Total Charges" value={chargesData.reduce((a,b)=>a+b,0).toLocaleString()} icon="📉" color="#f39c12" />
          <StatCard label="Statuts différents" value={statusLabels.length} icon="📊" color="#27ae60" />
        </section>
        {/* Grille principale */}
        <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, margin: '32px 36px 0 36px' }}>
          {/* Graphiques */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 18 }}>
            {/* Carte graphique améliorée */}
            <div style={{ ...cardStyle, background: 'linear-gradient(180deg, #f7fafd 60%, #e3f0fa 100%)', boxShadow: '0 2px 12px #bfc9d1', minHeight: 220, padding: 22, border: '1.5px solid #2a4d6c' }}
              onMouseOver={e=>{e.currentTarget.style.boxShadow='0 4px 24px #2a4d6c';e.currentTarget.style.transform='translateY(-2px) scale(1.02)'}}
              onMouseOut={e=>{e.currentTarget.style.boxShadow='0 2px 12px #bfc9d1';e.currentTarget.style.transform='none'}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18, color: '#2a4d6c' }}>📈</span>
                <h4 style={{ ...cardTitleStyle, margin: 0, fontSize: 17, color: '#2a4d6c' }}>Déclarations PME par mois</h4>
              </div>
              <div style={{ height: 160, width: '100%', overflow: 'hidden', padding: '0 8px', position: 'relative' }}>
                {loading ? <div className="skeleton-bar" style={{ width: '100%', height: 160, background: 'linear-gradient(90deg,#e3eafc 25%,#f7f8fa 50%,#e3eafc 75%)', borderRadius: 8, animation: 'skeleton 1.2s infinite linear' }} /> :
                <Bar
                  data={{
                    labels: Object.keys(monthCount),
                    datasets: [{ label: 'Déclarations', data: Object.values(monthCount), backgroundColor: '#2a4d6c', borderRadius: 12, barPercentage: 0.5, categoryPercentage: 0.7 }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: Object.values(monthCount).length > 0 ? { duration: 900, easing: 'easeOutQuart' } : false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: '#e3eafc' },
                        ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } },
                        max: Math.max(Math.ceil(Math.max(...Object.values(monthCount)) * 1.15), 5)
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } }
                      }
                    }
                  }}
                  height={160}
                />}
              </div>
            </div>
            {/* Autres graphiques avec même correction et design */}
            <div style={{ ...cardStyle, boxShadow: '0 2px 12px #bfc9d1', border: '1.5px solid #2a4d6c', minHeight: 220, padding: 22 }}
              onMouseOver={e=>{e.currentTarget.style.boxShadow='0 4px 24px #2a4d6c';e.currentTarget.style.transform='translateY(-2px) scale(1.02)'}}
              onMouseOut={e=>{e.currentTarget.style.boxShadow='0 2px 12px #bfc9d1';e.currentTarget.style.transform='none'}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18, color: '#2a4d6c' }}>📊</span>
                <h4 style={{ ...cardTitleStyle, margin: 0, fontSize: 17, color: '#2a4d6c' }}>Répartition des statuts</h4>
              </div>
              <div style={{ height: 160, width: '100%', overflow: 'hidden', padding: '0 8px', position: 'relative' }}>
                {loading ? (
                  <div className="skeleton-bar" style={{ width: '100%', height: 160, background: 'linear-gradient(90deg,#e3eafc 25%,#f7f8fa 50%,#e3eafc 75%)', borderRadius: 80, animation: 'skeleton 1.2s infinite linear' }} />
                ) : (
                  <Pie
                    data={{
                      labels: statusLabels,
                      datasets: [
                        {
                          data: statusData,
                          backgroundColor: ['#2a4d6c','#27ae60','#e74c3c','#3498db','#8e44ad'],
                          borderWidth: 2,
                          borderColor: '#fff',
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } },
                        },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: statusData.length > 0 ? { duration: 900, easing: 'easeOutQuart' } : false,
                    }}
                    height={160}
                  />
                )}
              </div>
            </div>
            <div style={{ ...cardStyle, boxShadow: '0 2px 12px #bfc9d1', border: '1.5px solid #2a4d6c', minHeight: 220, padding: 22 }}
              onMouseOver={e=>{e.currentTarget.style.boxShadow='0 4px 24px #2a4d6c';e.currentTarget.style.transform='translateY(-2px) scale(1.02)'}}
              onMouseOut={e=>{e.currentTarget.style.boxShadow='0 2px 12px #bfc9d1';e.currentTarget.style.transform='none'}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18, color: '#3498db' }}>💰</span>
                <h4 style={{ ...cardTitleStyle, margin: 0, fontSize: 17, color: '#2a4d6c' }}>Chiffre d'affaires par PME</h4>
              </div>
              <div style={{ height: 160, width: '100%', overflow: 'hidden', padding: '0 8px', position: 'relative' }}>
                {loading ? (
                  <div className="skeleton-bar" style={{ width: '100%', height: 160, background: 'linear-gradient(90deg,#e3eafc 25%,#f7f8fa 50%,#e3eafc 75%)', borderRadius: 8, animation: 'skeleton 1.2s infinite linear' }} />
                ) : (
                  <Bar
                    data={{
                      labels: caLabels,
                      datasets: [
                        {
                          label: "Chiffre d'affaires",
                          data: caData,
                          backgroundColor: '#3498db',
                          borderRadius: 12,
                          barPercentage: 0.5,
                          categoryPercentage: 0.7,
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: caData.length > 0 ? { duration: 900, easing: 'easeOutQuart' } : false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: '#e3eafc' },
                          ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } },
                          max: Math.max(Math.ceil(Math.max(...caData) * 1.15), 5),
                        },
                        x: {
                          grid: { display: false },
                          ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } },
                        },
                      },
                    }}
                    height={160}
                  />
                )}
              </div>
            </div>
            {/* <div style={{ ...cardStyle, boxShadow: '0 2px 12px #bfc9d1', border: '1.5px solid #2a4d6c' }}
              onMouseOver={e=>{e.currentTarget.style.boxShadow='0 4px 24px #2a4d6c';e.currentTarget.style.transform='translateY(-2px) scale(1.02)'}}
              onMouseOut={e=>{e.currentTarget.style.boxShadow='0 2px 12px #bfc9d1';e.currentTarget.style.transform='none'}}
            >
              <h4 style={{ ...cardTitleStyle, color: '#2a4d6c' }}>Chiffre d'affaires par PME</h4>
              <Bar data={{labels: caLabels,datasets: [{ label: "Chiffre d'affaires", data: caData, backgroundColor: '#3498db', borderRadius: 12, barPercentage: 0.5, categoryPercentage: 0.7 }],}} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, animation: caData.length > 0 ? { duration: 900, easing: 'easeOutQuart' } : false, scales: { y: { beginAtZero: true, grid: { color: '#e3eafc' }, ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } }, max: Math.max(Math.ceil(Math.max(...caData) * 1.15), 5) }, x: { grid: { display: false }, ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } } } } }} height={160} />
            </div>
            <div style={{ ...cardStyle, boxShadow: '0 2px 12px #bfc9d1', border: '1.5px solid #2a4d6c' }}
              onMouseOver={e=>{e.currentTarget.style.boxShadow='0 4px 24px #2a4d6c';e.currentTarget.style.transform='translateY(-2px) scale(1.02)'}}
              onMouseOut={e=>{e.currentTarget.style.boxShadow='0 2px 12px #bfc9d1';e.currentTarget.style.transform='none'}}
            >
              <h4 style={{ ...cardTitleStyle, color: '#2a4d6c' }}>Charges par PME</h4>
              <Bar data={{labels: caLabels,datasets: [{ label: 'Charges', data: chargesData, backgroundColor: '#f39c12', borderRadius: 12, barPercentage: 0.5, categoryPercentage: 0.7 }],}} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, animation: chargesData.length > 0 ? { duration: 900, easing: 'easeOutQuart' } : false, scales: { y: { beginAtZero: true, grid: { color: '#e3eafc' }, ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } }, max: Math.max(Math.ceil(Math.max(...chargesData) * 1.15), 5) }, x: { grid: { display: false }, ticks: { color: '#2a4d6c', font: { size: 13, weight: 'bold' } } } } }} height={160} />
            </div> */}
          </div>
          {/* Tâches & Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ ...cardStyle, minHeight: 180 }}>
              <h4 style={cardTitleStyle}>Carnet des tâches</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {tasks.length === 0 && <li style={{ color: '#888', fontStyle: 'italic' }}>Aucune tâche</li>}
                {tasks.map((t, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} style={{ marginRight: 8 }} />
                    <span style={{ textDecoration: t.done ? 'line-through' : 'none', flex: 1 }}>{t.text}</span>
                    <button onClick={() => removeTask(i)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', marginTop: 8 }}>
                <input type="text" value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="Nouvelle tâche..." style={{ flex: 1, padding: 6, borderRadius: 5, border: '1px solid #ececec', fontSize: 14 }} />
                <button onClick={addTask} style={{ marginLeft: 8, background: '#3498db', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Ajouter</button>
              </div>
            </div>
            <div style={{ ...cardStyle, minHeight: 180 }}>
              <h4 style={cardTitleStyle}>Conversations</h4>
              <div style={{ maxHeight: 90, overflowY: 'auto', marginBottom: 8, border: '1px solid #ececec', borderRadius: 5, padding: 8, background: '#f7f8fa' }}>
                {messages.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>Aucune conversation</div>}
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: '#003366' }}>{m.from}:</span> <span>{m.text}</span>
                    <span style={{ color: '#888', fontSize: 11, marginLeft: 8 }}>{m.date}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex' }}>
                <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Votre message..." style={{ flex: 1, padding: 6, borderRadius: 5, border: '1px solid #ececec', fontSize: 14 }} />
                <button onClick={sendMsg} style={{ marginLeft: 8, background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Envoyer</button>
              </div>
            </div>
          </div>
        </section>
        {/* Liste PME */}
        <section style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 24, margin: '32px 36px', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, color: '#003366', fontWeight: 700 }}>Liste des PME</h3>
            <input type="text" placeholder="Rechercher PME..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 6, borderRadius: 5, border: '1px solid #ececec', fontSize: 14 }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f7f8fa' }}>
                <th style={{ padding: 8 }}>Nom</th>
                <th>RCCM</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 12 }}>Aucune PME trouvée</td></tr>}
              {filtered.map((d, i) => (
                <tr key={d.dossierNumber || i} style={{ borderBottom: '1px solid #ececec' }}>
                  <td style={{ padding: 8 }}>{d.nomEntreprise}</td>
                  <td>{d.rccm}</td>
                  <td>{d.validation}</td>
                  <td>{d.dateSoumission ? d.dateSoumission.slice(0,10) : ''}</td>
                  <td><button onClick={() => setSelected(d)} style={{ fontSize: 13, padding: '2px 10px', borderRadius: 5, background: '#3498db', color: '#fff', border: 'none', cursor: 'pointer' }}>Visiter</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {/* Modal de consultation PME */}
        {selected && (
          <PMEDetailModal
            open={!!selected}
            declaration={selected}
            onClose={() => setSelected(null)}
            enqueueSnackbar={enqueueSnackbar}
            onStatusChange={async (newStatus) => {
              // Update status in localStorage
              const all = JSON.parse(localStorage.getItem('pmeDeclarations') || '[]');
              const idx = all.findIndex(d => d.dossierNumber === selected.dossierNumber);
              if (idx !== -1) {
                all[idx] = { ...all[idx], validation: newStatus };
                localStorage.setItem('pmeDeclarations', JSON.stringify(all));
                setDeclarations(all);
                setSelected({ ...selected, validation: newStatus });
              }
            }}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardInspecteur;

// Styles utilitaires
const sidebarBtnStyle = { width: '90%', padding: '10px 0', borderRadius: 7, background: 'none', border: 'none', color: '#2a4d6c', fontWeight: 600, fontSize: 16, textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s' };
const cardStyle = { background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', minHeight: 160 };
const cardTitleStyle = { marginBottom: 8, color: '#003366', fontWeight: 700, fontSize: 16 };

// Carte statistique
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 28, color, background: '#f7f8fa', borderRadius: 8, padding: '8px 14px', fontWeight: 700 }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, fontSize: 22, color: '#003366' }}>{value}</span>
        <span style={{ color: '#888', fontWeight: 500, fontSize: 14 }}>{label}</span>
      </div>
    </div>
  );
}
