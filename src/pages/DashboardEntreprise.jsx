import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardEntreprise = ({ user, onLogout }) => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px #e3eafc', padding: '2.2rem 1.5rem', maxWidth: 350, width: '100vw', textAlign: 'center' }}>
        <h2 style={{ color: '#003366', fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Bienvenue {user?.username || 'Entreprise'}</h2>
        <p style={{ color: '#444', fontSize: 14, marginBottom: 18 }}>Tableau de bord Entreprise</p>
        <button onClick={onLogout} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Déconnexion</button>
      </div>
    </div>
  );
};

export default DashboardEntreprise;
