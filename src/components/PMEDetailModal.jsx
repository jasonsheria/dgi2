import React, { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'En attente', label: 'En attente' },
  { value: 'Accepter', label: 'Accepter' },
  { value: 'Rejeter', label: 'Rejeter' },
  { value: 'À modifier', label: 'À modifier' },
];

const statusColor = status => {
  switch (status) {
    case 'Accepter': return '#27ae60';
    case 'Rejeter': return '#e74c3c';
    case 'À modifier': return '#f39c12';
    default: return '#bfc9d1';
  }
};

export default function PMEDetailModal({ open, onClose, declaration, onStatusChange, enqueueSnackbar }) {
  const [status, setStatus] = useState(declaration?.validation || 'En attente');
  const [pending, setPending] = useState(false);

  if (!open || !declaration) return null;

  const handleStatusChange = e => {
    setStatus(e.target.value);
  };

  const handleSave = () => {
    setPending(true);
    Promise.resolve()
      .then(() => onStatusChange && onStatusChange(status))
      .then(() => {
        enqueueSnackbar && enqueueSnackbar('Statut mis à jour avec succès', { variant: 'success' });
      })
      .catch(() => {
        enqueueSnackbar && enqueueSnackbar('Erreur lors de la mise à jour du statut', { variant: 'error' });
      })
      .finally(() => setPending(false));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,40,60,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, boxShadow: '0 2px 24px #bfc9d1', width: '95vw', maxWidth: 650, padding: 28, position: 'relative', minHeight: 400, display: 'flex', flexDirection: 'column',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} title="Fermer">×</button>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#222', textAlign: 'center' }}>Détails de la déclaration PME</h2>
        <div style={{ display: 'flex', gap: 32, marginTop: 18, flexWrap: 'wrap' }}>
          {/* Infos générales */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <h4 style={{ color: '#3498db', margin: '0 0 8px 0', fontSize: 15 }}>Informations générales</h4>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}><b>Entreprise :</b> {declaration.nomEntreprise}</div>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}><b>Année fiscale :</b> {declaration.anneeFiscale}</div>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}><b>Chiffre d'affaires :</b> {declaration.chiffreAffaires}</div>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}><b>Charges :</b> {declaration.charges}</div>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}><b>Date de soumission :</b> {new Date(declaration.dateSoumission).toLocaleString()}</div>
            <div style={{ fontSize: 13, color: '#444', marginBottom: 6 }}><b>Dossier :</b> {declaration.dossierNumber}</div>
          </div>
          {/* Documents */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <h4 style={{ color: '#3498db', margin: '0 0 8px 0', fontSize: 15 }}>Documents</h4>
            {declaration.files && Object.entries(declaration.files).map(([key, file]) => file && (
              <div key={key} style={{ fontSize: 13, color: '#444', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>{key} :</span>
                <span>{file.name}</span>
                <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('download-pme-file', { detail: file.path })); }} style={{ color: '#27ae60', fontSize: 15, textDecoration: 'none' }}>⬇️</a>
              </div>
            ))}
          </div>
        </div>
        {/* Statut */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontWeight: 600, color: '#444', fontSize: 15 }}>Statut :</span>
          <select value={status} onChange={handleStatusChange} style={{ fontWeight: 600, color: statusColor(status), fontSize: 15, border: '1px solid #ececec', borderRadius: 4, padding: '0.2rem 0.7rem', background: '#f7f8fa' }}>
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <span style={{ color: statusColor(status), fontWeight: 700, fontSize: 15 }}>{status}</span>
          <button onClick={handleSave} disabled={pending} style={{ marginLeft: 18, background: '#3498db', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15, opacity: pending ? 0.6 : 1 }}>Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
