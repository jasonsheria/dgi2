import React, { useState } from 'react';
import DeclarationPME from './DeclarationPME';
import pmeImg from '../assets/pme-illustration.svg';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const getTypeEntreprise = (ca) => {
  if (ca < 30000) return { label: 'Micro Entreprise', color: '#8e44ad' };
  if (ca >= 30000 && ca < 90000) return { label: 'Petite Entreprise', color: '#3498db' };
  if (ca >= 90000 && ca < 400000) return { label: 'Moyenne Entreprise', color: '#f39c12' };
  if (ca >= 400000) return { label: 'Grande Entreprise', color: '#e74c3c' };
  return { label: 'Non défini', color: '#bfc9d1' };
};

const DashboardPME = ({ user }) => {
  // Récupérer la déclaration soumise
  const declaration = JSON.parse(localStorage.getItem('pmeDeclaration') || '{}');
  const dossierNumber = declaration.dossierNumber || '—';
  const rccm = declaration.rccm || '—';
  const validation = declaration.validation || '—';
  const ca = parseFloat(declaration.chiffreAffaires) || 0;
  const charges = parseFloat(declaration.charges) || 0;
  // Données pour les graphiques
  const perf = ca > 0 ? Math.round(((ca - charges) / ca) * 100) : 0;
  const doughnutData = {
    labels: ['Résultat', 'Charges'],
    datasets: [{
      data: [ca - charges, charges],
      backgroundColor: ['#4e73df', '#f6c23e'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };
  const barData = {
    labels: ['Chiffre d’Affaires', 'Charges'],
    datasets: [{
      label: 'Montant (FCFA)',
      data: [ca, charges],
      backgroundColor: ['#36b9cc', '#e74a3b'],
      borderRadius: 8,
      maxBarThickness: 32,
    }],
  };
  // Progression persistée
  const draft = JSON.parse(localStorage.getItem('pmeDeclarationDraft') || '{}');
  const totalFields = 18; // à ajuster si besoin
  const filledFields = (draft.form ? Object.values(draft.form).filter(Boolean).length : 0) + (draft.files ? Object.values(draft.files).filter(Boolean).length : 0);
  const progress = Math.round((filledFields / totalFields) * 100);

  const typeEntreprise = getTypeEntreprise(ca);
  // Historique fictif pour graphique collecte de fonds (à remplacer par vrai historique si dispo)
  const historique = [
    { annee: 2022, ca: ca * 0.7, charges: charges * 0.7 },
    { annee: 2023, ca: ca * 0.85, charges: charges * 0.85 },
    { annee: 2024, ca, charges },
  ];
  const collecteData = {
    labels: historique.map(h => h.annee),
    datasets: [
      { label: "Chiffre d'affaires", data: historique.map(h => h.ca), backgroundColor: '#36b9cc', borderRadius: 8 },
      { label: 'Charges', data: historique.map(h => h.charges), backgroundColor: '#e74a3b', borderRadius: 8 },
    ],
  };

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex', flexDirection: 'row', alignItems: 'stretch', padding: 0 }}>
      {/* Sidebar PME */}
      <aside style={{ width: 210, background: '#e3f0fa', borderRight: '1px solid #d0e2f2', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 0 0', minHeight: '100vh', position: 'sticky', top: 0, zIndex: 20 }}>
        <img src={pmeImg} alt="PME" style={{ width: 54, height: 54, borderRadius: 12, marginBottom: 10, background: '#fff', boxShadow: '0 1px 4px #e3eafc' }} />
        <div style={{ fontWeight: 700, color: '#003366', fontSize: 18, marginBottom: 6 }}>{user?.username || 'Entreprise'}</div>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 18 }}>{user?.email || 'entreprise@dgi.gov'}</div>
        <nav style={{ width: '100%' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
            {['Accueil','Déclaration','Statistiques','Profil','Déconnexion'].map((item, idx) => (
              <li key={item} style={{ margin: '12px 0' }}>
                <button style={{ width: '90%', padding: '10px 0', borderRadius: 7, background: 'none', border: 'none', color: '#2a4d6c', fontWeight: 600, fontSize: 16, textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s' }}>{item}</button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main PME */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '1.5rem 1rem', maxWidth: 700, width: '98vw', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.7s' }}>
          {/* Header moderne */}
          <div style={{ width: '100%', background: 'linear-gradient(90deg, #f7f8fa 60%, #e3eafc 100%)', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '0.8rem 1.2rem 0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: 12, boxSizing: 'border-box', boxShadow: '0 2px 8px #f0f4fa', marginBottom: 10 }}>
            <img src={pmeImg} alt="PME" style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', boxShadow: '0 1px 4px #e3eafc', marginRight: 8 }} />
            <h2 style={{ color: '#003366', margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: 0.1, flex: 1, textAlign: 'left' }}>Tableau de bord PME</h2>
          </div>
          <h2 style={{ color: '#222', fontWeight: 700, fontSize: 20, marginBottom: 8, textAlign: 'center' }}>Tableau de bord entreprise</h2>
          {/* Type d'entreprise */}
          <div style={{ marginBottom: 10, fontWeight: 600, color: typeEntreprise.color, fontSize: 16, background: '#f7f8fa', borderRadius: 6, padding: '0.2rem 0.7rem', display: 'inline-block', border: '1px solid #ececec' }}>
            Type d'entreprise : {typeEntreprise.label}
          </div>
          {/* Barre de progression persistée */}
          <div className="progress-bar-animated" style={{ width: '100%', margin: '0 0 10px 0', padding: '0 2vw', boxSizing: 'border-box' }}>
            <div className="progress-bar-bg" style={{ height: 5, borderRadius: 2, background: '#ececec' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: '#4e73df', height: 5, borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <div className="progress-bar-label" style={{ fontWeight: 500, color: '#888', marginTop: 2, fontSize: 12, textAlign: 'center' }}>{progress}% complété</div>
          </div>
          {/* Cartes infos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, width: '100%', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ minWidth: 180, flex: 1, background: '#f7f8fa', borderRadius: 10, padding: '1rem', boxShadow: '0 2px 8px #ececec' }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Numéro de dossier</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{dossierNumber}</div>
              <div style={{ fontSize: 13, color: '#888', margin: '8px 0 0 0' }}>Code RCCM</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{rccm}</div>
              <div style={{ fontSize: 13, color: '#888', margin: '8px 0 0 0' }}>Statut de validation</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{validation}</div>
            </div>
            <div style={{ minWidth: 180, flex: 1, background: '#f7f8fa', borderRadius: 10, padding: '1rem', boxShadow: '0 2px 8px #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, color: '#444', marginBottom: 6 }}>Performance</div>
              <Doughnut data={doughnutData} options={{ plugins: { legend: { display: true, position: 'bottom' } } }} style={{ maxWidth: 120, margin: '0 auto' }} />
              <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Résultat : <b>{perf}%</b></div>
            </div>
            <div style={{ minWidth: 180, flex: 1, background: '#f7f8fa', borderRadius: 10, padding: '1rem', boxShadow: '0 2px 8px #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, color: '#444', marginBottom: 6 }}>Répartition</div>
              <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} style={{ maxWidth: 130, margin: '0 auto' }} />
            </div>
          </div>
          {/* Graphique collecte de fonds */}
          <div style={{ width: '100%', background: '#f7f8fa', borderRadius: 10, padding: '1rem', boxShadow: '0 2px 8px #ececec', marginBottom: 18 }}>
            <div style={{ fontWeight: 600, color: '#444', marginBottom: 6 }}>Collecte de fonds (historique)</div>
            <Bar data={collecteData} options={{ plugins: { legend: { display: true, position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} style={{ maxWidth: 350, margin: '0 auto' }} />
          </div>
          <div style={{ marginTop: 12, width: '100%', textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: 13, padding: '0.3rem 1.2rem', borderRadius: 6, fontWeight: 600 }}>Afficher mes données</button>
          </div>
          {/* Modal déclaration détaillée PME */}
          {showModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px #bfc9d1', padding: '2rem 1.5rem', minWidth: 320, maxWidth: 500, width: '90vw', position: 'relative' }}>
                <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
                <h3 style={{ textAlign: 'center', color: '#003366', marginBottom: 10 }}>Données détaillées PME</h3>
                <div style={{ marginBottom: 10 }}><b>Nom :</b> {declaration.nomEntreprise}</div>
                <div style={{ marginBottom: 10 }}><b>Type :</b> <span style={{ color: typeEntreprise.color, fontWeight: 600 }}>{typeEntreprise.label}</span></div>
                <div style={{ marginBottom: 10 }}><b>RCCM :</b> {rccm}</div>
                <div style={{ marginBottom: 10 }}><b>Statut :</b> {validation}</div>
                <div style={{ marginBottom: 10 }}><b>Date :</b> {declaration.dateSoumission ? new Date(declaration.dateSoumission).toLocaleString() : '—'}</div>
                <div style={{ marginBottom: 10 }}><b>Chiffre d'affaires :</b> {declaration.chiffreAffaires || '—'}</div>
                <div style={{ marginBottom: 10 }}><b>Charges :</b> {declaration.charges || '—'}</div>
                {/* Affichage fichiers uploadés */}
                <div style={{ marginBottom: 10 }}><b>Fichiers uploadés :</b>
                  <ul style={{ fontSize: 12, color: '#444', margin: 0, padding: 0, listStyle: 'none' }}>
                    {declaration.files && Object.entries(declaration.files).map(([k, v]) => (
                      v && v.name ? (
                        <li key={k} style={{ marginBottom: 4 }}>
                          <span style={{ color: '#888' }}>{k} :</span> <a href={URL.createObjectURL(v)} download={v.name} style={{ color: '#3498db', textDecoration: 'underline' }}>{v.name}</a>
                        </li>
                      ) : null
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button className="btn-secondary" onClick={() => { setEditMode(true); setShowModal(false); }} style={{ fontSize: 12, padding: '0.2rem 1rem', borderRadius: 5 }}>Modifier la déclaration</button>
                </div>
              </div>
            </div>
          )}
          {/* Edition de la déclaration (réutilise DeclarationPME) */}
          {editMode && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px #bfc9d1', padding: '1.5rem 1rem', minWidth: 320, maxWidth: 600, width: '95vw', position: 'relative' }}>
                <button onClick={() => setEditMode(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
                <DeclarationPME onSubmit={() => { setEditMode(false); window.location.reload(); }} user={user} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPME;
