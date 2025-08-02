import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DashboardAdmin = ({ user }) => {
  const [declarations, setDeclarations] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('pmeDeclarations') || '[]');
    setDeclarations(data);
    // Simuler des messages (à remplacer par backend)
    setMessages([
      { from: 'Inspecteur', content: 'Merci de vérifier la déclaration PME #1', date: '2025-07-30' },
      { from: 'PME', content: 'J’ai une question sur la fiscalité', date: '2025-07-29' },
    ]);
  }, []);

  // Statistiques
  const statusCount = declarations.reduce((acc, d) => {
    acc[d.validation] = (acc[d.validation] || 0) + 1;
    return acc;
  }, {});
  const monthCount = declarations.reduce((acc, d) => {
    const m = d.dateSoumission ? d.dateSoumission.slice(0,7) : 'Inconnu';
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const caLabels = declarations.map(d => d.nomEntreprise || 'PME');
  const caData = declarations.map(d => parseFloat(d.chiffreAffaires) || 0);
  const chargesData = declarations.map(d => parseFloat(d.charges) || 0);
  // KPIs
  const totalPME = declarations.length;
  const totalCA = caData.reduce((a, b) => a + b, 0);
  const totalCharges = chargesData.reduce((a, b) => a + b, 0);
  // Carnet des tâches (non persistant)
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const addTask = () => {
    if (taskInput.trim()) setTasks([...tasks, { text: taskInput, done: false }]);
    setTaskInput('');
  };
  const toggleTask = idx => setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  const removeTask = idx => setTasks(tasks.filter((_, i) => i !== idx));

  return (
    <div style={{ padding: '2vw', background: '#f7f8fa', minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#003366', fontWeight: 800, marginBottom: 18, fontSize: '2.1rem', letterSpacing: 0.5 }}>Tableau de bord Administrateur</h2>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 18, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 32, color: '#3498db', fontWeight: 700 }}>{totalPME}</span>
          <span style={{ color: '#888', fontWeight: 500, fontSize: 15 }}>PME déclarées</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 32, color: '#8e44ad', fontWeight: 700 }}>{totalCA.toLocaleString()} FCFA</span>
          <span style={{ color: '#888', fontWeight: 500, fontSize: 15 }}>Total Chiffre d'affaires</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 32, color: '#f39c12', fontWeight: 700 }}>{totalCharges.toLocaleString()} FCFA</span>
          <span style={{ color: '#888', fontWeight: 500, fontSize: 15 }}>Total Charges</span>
        </div>
      </div>
      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: 24, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', height: 260 }}>
          <h4 style={{ marginBottom: 8 }}>Déclarations PME par mois</h4>
          <div style={{ flex: 1, minHeight: 180 }}>
            <Bar
              data={{
                labels: Object.keys(monthCount),
                datasets: [{ label: 'Déclarations', data: Object.values(monthCount), backgroundColor: '#3498db' }],
              }}
              options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }}
              height={180}
            />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', height: 260 }}>
          <h4 style={{ marginBottom: 8 }}>Répartition des statuts</h4>
          <div style={{ flex: 1, minHeight: 180 }}>
            <Pie
              data={{
                labels: Object.keys(statusCount),
                datasets: [{ data: Object.values(statusCount), backgroundColor: ['#f39c12','#27ae60','#e74c3c','#3498db','#8e44ad'] }],
              }}
              options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }}
              height={180}
            />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', height: 260 }}>
          <h4 style={{ marginBottom: 8 }}>Chiffre d'affaires par PME</h4>
          <div style={{ flex: 1, minHeight: 180 }}>
            <Bar
              data={{
                labels: caLabels,
                datasets: [{ label: "Chiffre d'affaires", data: caData, backgroundColor: '#8e44ad' }],
              }}
              options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }}
              height={180}
            />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, display: 'flex', flexDirection: 'column', height: 260 }}>
          <h4 style={{ marginBottom: 8 }}>Charges par PME</h4>
          <div style={{ flex: 1, minHeight: 180 }}>
            <Bar
              data={{
                labels: caLabels,
                datasets: [{ label: 'Charges', data: chargesData, backgroundColor: '#f39c12' }],
              }}
              options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }}
              height={180}
            />
          </div>
        </div>
      </div>
      {/* Messagerie & tâches */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Messagerie */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, minHeight: 260 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Messagerie</h3>
          <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 10, border: '1px solid #ececec', borderRadius: 5, background: '#f7f8fa', padding: 8 }}>
            {messages.length === 0 && <div style={{ color: '#888', textAlign: 'center' }}>Aucun message</div>}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 8, background: '#fff', borderRadius: 6, padding: 8, boxShadow: '0 1px 4px #e3eafc' }}>
                <b>{msg.from}</b> <span style={{ color: '#888', fontSize: 12 }}>({msg.date})</span><br />
                {msg.content}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Votre message..." style={{ flex: 1, padding: 7, borderRadius: 5, border: '1px solid #ececec', fontSize: 14 }} />
            <button onClick={handleSend} style={{ background: '#3498db', color: '#fff', border: 'none', borderRadius: 5, padding: '7px 18px', fontWeight: 600, cursor: 'pointer' }}>Envoyer</button>
          </div>
        </div>
        {/* Carnet des tâches */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, minHeight: 260 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Carnet des tâches</h3>
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
      </div>
      {/* Liste PME */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px #e3eafc', padding: 18, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Liste des PME</h3>
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
      </div>
      {/* Modal de consultation PME */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px #bfc9d1', padding: '2rem 1.5rem', minWidth: 320, maxWidth: 500, width: '90vw', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            <h3 style={{ color: '#003366', marginBottom: 10, fontSize: 17 }}>Déclaration PME</h3>
            <div style={{ marginBottom: 10 }}><b>Nom :</b> {selected.nomEntreprise}</div>
            <div style={{ marginBottom: 10 }}><b>RCCM :</b> {selected.rccm}</div>
            <div style={{ marginBottom: 10 }}><b>Statut :</b> {selected.validation}</div>
            <div style={{ marginBottom: 10 }}><b>Date :</b> {selected.dateSoumission ? selected.dateSoumission.slice(0,10) : ''}</div>
            <div style={{ marginBottom: 10 }}><b>Documents :</b>
              <ul style={{ paddingLeft: 18 }}>
                {selected.files && Object.entries(selected.files).map(([k, v]) => (
                  v && v.name ? (
                    <li key={k} style={{ marginBottom: 3 }}>
                      {k} : <span style={{ color: '#3498db' }}>{v.name}</span>
                      <button style={{ marginLeft: 8, fontSize: 12, borderRadius: 4, background: '#ececec', border: 'none', color: '#003366', cursor: 'pointer', padding: '1px 7px' }} disabled>Télécharger</button>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Commentaire :</b>
              <textarea style={{ width: '100%', minHeight: 40, borderRadius: 5, border: '1px solid #ececec', marginTop: 4 }} placeholder="Ajouter un commentaire... (non persistant)" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSelected(null)}>Fermer</button>
              <button style={{ background: '#f39c12', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} disabled>Modifier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
