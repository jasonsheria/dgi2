import React, { useState } from 'react';
import dgiLogo from '../assets/dgi-logo.svg'; // Ajoutez un logo DGI dans assets
import { Link } from 'react-router-dom';
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('PME');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) return;
    onLogin({ username, role });
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#eaf6ff' }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', minWidth: 320, maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={dgiLogo} alt="DGI" style={{ width: 70, marginBottom: 8 }} />
          <h2 style={{ color: '#003366', margin: 0 }}>e-fiscalitis</h2>
          <div style={{ color: '#3498db', fontWeight: 600, fontSize: 16 }}>Direction Générale des Impôts</div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.7rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: 4 }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.7rem', marginBottom: '1.2rem', borderRadius: 4 }}>
            <option value="PME">Entreprise</option>
            <option value="Inspecteur">Inspecteur</option>
            <option value="Admin">Administrateur</option>
          </select>
          <button type="submit" style={{ width: '100%', padding: '0.7rem', background: '#003366', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: 16 }}>Se connecter</button>
          <p>Avez vous deja un compte? si non <Link to="/register"> Creer compte  </Link> </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
