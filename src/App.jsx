import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Login from './pages/Login';
import Register from './pages/Register';
import DeclarationPME from './pages/DeclarationPME';
import DashboardPME from './pages/DashboardPME';
import DashboardInspecteur from './pages/DashboardInspecteur';
import DashboardAdmin from './pages/DashboardAdmin';
import LandingDGI from './pages/LandingDGI';
import ForgotPassword from './pages/ForgotPassword';
import './App.css';

function getNomenclature(ca) {
  ca = parseFloat(ca);
  if (!ca && ca !== 0) return 'PME';
  if (ca < 30000) return 'Micro Entreprise';
  if (ca >= 30000 && ca < 90000) return 'Petite Entreprise';
  if (ca >= 90000 && ca < 400000) return 'Moyenne Entreprise';
  if (ca >= 400000) return 'Grande Entreprise';
  return 'PME';
}

function AccueilPME({ user, onStartDeclaration, onVisitEntreprise }) {
  const [showModal, setShowModal] = useState(false);
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  // Recherche dans le tableau pmeDeclarations
  const declarations = JSON.parse(localStorage.getItem('pmeDeclarations') || '[]');
  const handleVisit = () => {
    const found = declarations.find(d => d.nomEntreprise && inputName.trim().toLowerCase() === d.nomEntreprise.trim().toLowerCase());
    if (!found) {
      setError("Aucune déclaration trouvée pour ce nom d'entreprise.");
      return;
    }
    setError('');
    setShowModal(false);
    onVisitEntreprise();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px #e3eafc', padding: '2.2rem 1.5rem', maxWidth: 350,width: '100vw', textAlign: 'center' }}>
        <h2 style={{ color: '#003366', fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Bienvenue chez e-fiscalitis</h2>
        <p style={{ color: '#444', fontSize: 14, marginBottom: 18 }}>Que souhaitez-vous faire ?</p>
        <button className="btn-primary" style={{ width: '100%', marginBottom: 12, fontSize: 15, padding: '0.5rem 0', borderRadius: 7 }} onClick={onStartDeclaration}>Nouvelle déclaration</button>
        <button className="btn-secondary" style={{ width: '100%', fontSize: 15, padding: '0.5rem 0', borderRadius: 7 }} onClick={() => setShowModal(true)}>Visiter mon entreprise</button>
      </div>
      {/* Modal de saisie du nom d'entreprise */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px #bfc9d1', padding: '2rem 1.5rem', minWidth: 280, maxWidth: 350, width: '90vw', position: 'relative', textAlign: 'center' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
            <h3 style={{ color: '#003366', marginBottom: 10, fontSize: 17 }}>Accès entreprise</h3>
            <input
              type="text"
              placeholder="Nom de l'entreprise"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              style={{ width: '100%', padding: '0.4rem', borderRadius: 5, border: '1px solid #ececec', fontSize: 15, marginBottom: 10 }}
            />
            {error && <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 8 }}>{error}</div>}
            <button className="btn-primary" style={{ width: '100%', fontSize: 15, padding: '0.4rem 0', borderRadius: 6 }} onClick={handleVisit}>Accéder</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MainLayout({ user, onLogout }) {
  return (
    <div>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #f7f8fa 60%, #e3eafc 100%)',
        color: '#003366',
        padding: '0.5rem 1rem',
        minHeight: 48,
        boxShadow: '0 1px 8px #f0f4fa',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: 0.5, flex: 1, textAlign: 'left', lineHeight: 1.2 }}>e-fiscalitis</h1>
        <button
          onClick={onLogout}
          style={{
            background: '#fff',
            color: '#003366',
            border: '1px solid #e3eafc',
            padding: '0.2rem 0.8rem',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            marginLeft: 10,
            boxShadow: '0 1px 4px #e3eafc',
            cursor: 'pointer',
            transition: 'background 0.2s',
            minWidth: 0,
          }}
        >
          Déconnexion
        </button>
      </header>
      <main style={{ margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/dashboard" element={<Navigate to={
            user.role === 'PME' ? '/dashboard/pme' :
            user.role === 'Inspecteur' ? '/dashboard/inspecteur' :
            '/dashboard/admin'
          } replace />} />
          <Route path="/dashboard/pme" element={<DashboardPME user={user} />} />
          <Route path="/dashboard/inspecteur" element={<DashboardInspecteur user={user} />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin user={user} />} />
          <Route path="*" element={<Navigate to={
            user.role === 'PME' ? '/dashboard/pme' :
            user.role === 'Inspecteur' ? '/dashboard/inspecteur' :
            '/dashboard/admin'
          } replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  // Auth simple
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
      return null;
    }
  });
  const [hasDeclaration, setHasDeclaration] = useState(false);
  const [showAccueil, setShowAccueil] = useState(false);
  const [showDeclarationForm, setShowDeclarationForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user && user.role === 'PME') {
      setShowAccueil(true);
      setHasDeclaration(!!localStorage.getItem('pmeDeclaration'));
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'PME') setShowAccueil(true);
    else if (userData.role === 'Inspecteur') navigate('/dashboard/inspecteur');
    else navigate('/dashboard/admin');
  };

  const handleDeclarationSubmit = (data) => {
    localStorage.setItem('pmeDeclaration', JSON.stringify(data));
    setHasDeclaration(true);
    setShowDeclarationForm(false);
    setShowAccueil(false);
    navigate('/dashboard/pme');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setHasDeclaration(false);
    // localStorage.clear();
    navigate('/login');
  };

  // Accueil PME : choix entre nouvelle déclaration ou accès entreprise
  if (user && user.role === 'PME' && showAccueil && !showDeclarationForm) {
    return <AccueilPME
      user={user}
      onStartDeclaration={() => { setShowDeclarationForm(true); setShowAccueil(false); setHasDeclaration(false); localStorage.removeItem('pmeDeclaration'); }}
      onVisitEntreprise={() => { setShowAccueil(false); navigate('/dashboard/pme'); }}
    />;
  }

  // Afficher le formulaire de déclaration si demandé
  if (user && user.role === 'PME' && showDeclarationForm) {
    return <DeclarationPME onSubmit={handleDeclarationSubmit} onLogout={handleLogout} user={user} />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingDGI />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Utiliser le layout principal avec le router pour tous les rôles
  return (
    <SnackbarProvider maxSnack={2} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <MainLayout user={user} onLogout={handleLogout} />
    </SnackbarProvider>
  );
}

export default App;
