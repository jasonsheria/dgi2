import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const Register = () => {
  const [type, setType] = useState('entreprise');
  const [form, setForm] = useState({ username: '', email: '', password: '', company: '' });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.username || !form.password || (type === 'entreprise' && !form.company)) return;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({ ...form, type });
    localStorage.setItem('users', JSON.stringify(users));
    setSuccess(true);
    setTimeout(() => navigate('/login'), 1800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg,#eaf3fa,#c9e0f3)' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #bfc9d1', minWidth: 320 }}>
        <h2 style={{ color: '#2a4d6c', marginBottom: 18 }}>Créer un compte</h2>
        <div style={{ marginBottom: 14 }}>
          <label style={{ marginRight: 12 }}>
            <input type="radio" name="type" value="entreprise" checked={type==='entreprise'} onChange={()=>setType('entreprise')} /> Entreprise
          </label>
          <label>
            <input type="radio" name="type" value="inspecteur" checked={type==='inspecteur'} onChange={()=>setType('inspecteur')} /> Inspecteur
          </label>
        </div>
        <input name="username" placeholder="Nom d'utilisateur" value={form.username} onChange={handleChange} style={inputStyle} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={inputStyle} type="email" required />
        {type==='entreprise' && (
          <input name="company" placeholder="Nom de l'entreprise" value={form.company} onChange={handleChange} style={inputStyle} required />
        )}
        <input name="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} style={inputStyle} type="password" required />
        <button type="submit" style={btnStyle}>S'enregistrer</button>
        {success && <div style={{ color: '#27ae60', marginTop: 12, fontWeight: 600 }}>✅ Enregistrement réussi ! Redirection...</div>}
        <p>Avez vous deja un compte? <Link to="/login"> Se connecter </Link> </p>
        
      </form>
      
    </div>
  );
};

const inputStyle = { width: '100%', marginBottom: 12, padding: 10, borderRadius: 7, border: '1px solid #e3eafc', fontSize: 15 };
const btnStyle = { width: '100%', background: '#2a4d6c', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 0', fontWeight: 700, fontSize: 16, marginTop: 8, cursor: 'pointer' };

export default Register;
