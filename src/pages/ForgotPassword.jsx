import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleRequest = e => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.email === email);
    if (user) {
      setStep(2);
      setError('');
    } else {
      setError("Utilisateur ou email incorrect");
    }
  };

  const handleReset = e => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.username === username && u.email === email);
    if (idx !== -1) {
      users[idx].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg,#eaf3fa,#c9e0f3)' }}>
      <form onSubmit={step===1?handleRequest:handleReset} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #bfc9d1', minWidth: 320 }}>
        <h2 style={{ color: '#2a4d6c', marginBottom: 18 }}>Mot de passe oublié</h2>
        {step===1 ? (
          <>
            <input name="username" placeholder="Nom d'utilisateur" value={username} onChange={e=>setUsername(e.target.value)} style={inputStyle} required />
            <input name="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} type="email" required />
            <button type="submit" style={btnStyle}>Valider</button>
            {error && <div style={{ color: '#e74c3c', marginTop: 12, fontWeight: 600 }}>{error}</div>}
          </>
        ) : (
          <>
            <input name="newPassword" placeholder="Nouveau mot de passe" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={inputStyle} type="password" required />
            <button type="submit" style={btnStyle}>Réinitialiser</button>
            {success && <div style={{ color: '#27ae60', marginTop: 12, fontWeight: 600 }}>✅ Mot de passe réinitialisé ! Redirection...</div>}
          </>
        )}
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', marginBottom: 12, padding: 10, borderRadius: 7, border: '1px solid #e3eafc', fontSize: 15 };
const btnStyle = { width: '100%', background: '#2a4d6c', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 0', fontWeight: 700, fontSize: 16, marginTop: 8, cursor: 'pointer' };

export default ForgotPassword;
