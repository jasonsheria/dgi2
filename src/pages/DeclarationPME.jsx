import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import uploadImg from '../assets/upload-illustration.svg';
import step1Img from '../assets/step1.svg';
import step2Img from '../assets/step2.svg';
import step3Img from '../assets/step3.svg';
import dgiPdf from '../assets/D3409.pdf';
import { saveFile } from '../utils/fileStorage';

const steps = [
    { label: 'Informations Générales', fields: ['nomEntreprise', 'anneeFiscale'], illustration: step1Img, description: "Renseignez les informations de base de votre entreprise." },
    { label: 'Chiffres d’Affaires', fields: ['chiffreAffaires', 'charges'], illustration: step2Img, description: "Indiquez vos chiffres clés pour l'année fiscale." },
    // Nouvelle étape 1
    {
        label: "Documents d’enregistrement légal", description: "Téléversez les documents d’enregistrement légal requis.", uploads: [
            { name: 'lettreNIF', label: 'Lettre de demande d’attribution du NIF' },
            { name: 'statuts', label: 'Statuts constitutifs (ou formulaire simplifié)' },
            { name: 'rccm', label: 'Extrait du RCCM récent' },
            { name: 'guce', label: 'Attestation d’enregistrement au GUCE (si applicable)' },
        ]
    },
    // Nouvelle étape 2
    {
        label: "Pièces d’identité du représentant légal", description: "Téléversez les pièces d’identité du représentant légal.", uploads: [
            { name: 'cni', label: 'Carte d’identité nationale ou passeport' },
            { name: 'specimenSignature', label: 'Spécimen de signature du gérant' },
            { name: 'titreSejour', label: 'Titre de séjour (si étranger)' },
            { name: 'contratMariage', label: 'Contrat de mariage (si nécessaire)' },
        ]
    },
    // Nouvelle étape 3
    {
        label: "Justificatifs d’adresse du siège social", description: "Téléversez les justificatifs d’adresse du siège social.", uploads: [
            { name: 'titrePropriete', label: 'Titre de propriété ou contrat de bail' },
            { name: 'facture', label: 'Facture récente (électricité, eau)' },
            { name: 'lettreHebergement', label: 'Lettre d’hébergement et titre du logeur (si domiciliation)' },
        ]
    },
    // Nouvelle étape 4
    {
        label: "Preuve de libération du capital social (pour les sociétés)", description: "Téléversez la preuve de libération du capital social.", uploads: [
            { name: 'bordereauVersement', label: 'Bordereau de versement ou attestation bancaire' },
            { name: 'declarationSouscription', label: 'Déclaration de souscription et de versement' },
        ]
    },
    // Nouvelle étape 5
    {
        label: "Formulaires et déclarations fiscales", description: "Téléversez les formulaires et déclarations fiscales.", uploads: [
            { name: 'formulaireNIF', label: 'Formulaire officiel de demande de NIF' },
            { name: 'declarationHonneur', label: 'Déclaration sur l’honneur ou casier judiciaire' },
            { name: 'licences', label: 'Licences, agréments ou permis réglementaires' },
        ]
    },
    // Nouvelle étape 6
    {
        label: "Paiement des droits et redevances", description: "Téléversez la preuve de paiement des droits et redevances.", uploads: [
            { name: 'preuvePaiement', label: 'Preuve de paiement des frais de dossier' },
            { name: 'recuDroitProportionnel', label: 'Reçu du droit proportionnel (pour sociétés)' },
        ]
    },
    // Dernière étape : justificatif global
    { label: 'Documents finaux', fields: ['justificatif'], illustration: step3Img, description: "Ajoutez un document justificatif global pour valider votre déclaration." },
];

const LOCAL_KEY = 'pmeDeclarationDraft';

const loadDraft = () => {
    try {
        const draft = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
        return draft;
    } catch {
        return {};
    }
};

const DeclarationPME = ({ onSubmit, onLogout, user }) => {
    // Chargement du brouillon (étape, champs, fichiers)
    const draft = loadDraft();
    const [currentStep, setCurrentStep] = useState(draft.currentStep || 0);
    const [form, setForm] = useState(draft.form || {});
    const [files, setFiles] = useState(draft.files || {});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // Persistance automatique à chaque changement (plus de stockage localStorage du brouillon)
    React.useEffect(() => {
        // Ne rien faire ici, plus de sauvegarde automatique du brouillon
    }, [currentStep, form, files]);

    const totalFields = steps.reduce((acc, s) => acc + (s.fields ? s.fields.length : 0) + (s.uploads ? s.uploads.length : 0), 0);
    const filledFields = Object.values(form).filter(Boolean).length + Object.values(files).filter(Boolean).length;
    const progress = Math.round((filledFields / totalFields) * 100);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFile = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Contrôles de validation avancés
        if (!form.nomEntreprise || form.nomEntreprise.trim() === '') {
            enqueueSnackbar("Le nom de l'entreprise est obligatoire pour enregistrer la déclaration.", { variant: 'error' });
            setSubmitted(false);
            return;
        }
        if (!form.anneeFiscale || isNaN(Number(form.anneeFiscale)) || Number(form.anneeFiscale) < 2000) {
            enqueueSnackbar("L'année fiscale doit être un nombre valide (>= 2000).", { variant: 'error' });
            setSubmitted(false);
            return;
        }
        if (!form.chiffreAffaires || isNaN(Number(form.chiffreAffaires)) || Number(form.chiffreAffaires) < 0) {
            enqueueSnackbar("Le chiffre d'affaires doit être un nombre positif.", { variant: 'error' });
            setSubmitted(false);
            return;
        }
        if (!form.charges || isNaN(Number(form.charges)) || Number(form.charges) < 0) {
            enqueueSnackbar("Les charges doivent être un nombre positif.", { variant: 'error' });
            setSubmitted(false);
            return;
        }
        // Vérification des fichiers obligatoires (exemple: justificatif)
        if (!files.justificatif) {
            enqueueSnackbar("Le document justificatif est obligatoire.", { variant: 'error' });
            setSubmitted(false);
            return;
        }
        setSubmitted(true);
        setTimeout(async () => {
            setSubmitted(false);
            // Générer un numéro de dossier unique
            const dossierNumber = `DS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
            // Stocker chaque fichier dans IndexedDB et garder le chemin virtuel
            const filesMeta = {};
            for (const key of Object.keys(files)) {
                const f = files[key];
                if (f) {
                    const fileKey = `${form.nomEntreprise}_${dossierNumber}_${key}_${f.name}`;
                    await saveFile(fileKey, f);
                    filesMeta[key] = { name: f.name, size: f.size, type: f.type, path: fileKey };
                } else {
                    filesMeta[key] = null;
                }
            }
            // Préparer la déclaration à stocker (formulaire + métadonnées fichiers)
            const declarationMeta = {
                ...form,
                files: filesMeta,
                dossierNumber,
                validation: 'En attente',
                dateSoumission: new Date().toISOString(),
                rccm: form.rccm || '',
            };
            // Stocker dans le tableau pmeDeclarations (localStorage)
            let declarations = [];
            try {
                declarations = JSON.parse(localStorage.getItem('pmeDeclarations')) || [];
            } catch { declarations = []; }
            // Remplacer si même nomEntreprise, sinon ajouter
            const idx = declarations.findIndex(d => d.nomEntreprise === declarationMeta.nomEntreprise);
            if (idx !== -1) {
                declarations[idx] = declarationMeta;
            } else {
                declarations.push(declarationMeta);
            }
            localStorage.setItem('pmeDeclarations', JSON.stringify(declarations));
            enqueueSnackbar('Déclaration enregistrée avec succès !', { variant: 'success' });
            if (onSubmit) onSubmit(declarationMeta);
            navigate('/dashboard/pme');
        }, 1200);
    };

    const step = steps[currentStep];
    const fileName = files.justificatif ? files.justificatif.name : null;

    const nomenclature = (() => {
        const ca = parseFloat(form.chiffreAffaires);
        if (!ca && ca !== 0) return null;
        if (ca < 30000) return { label: 'Micro Entreprise', color: '#8e44ad' };
        if (ca >= 30000 && ca < 90000) return { label: 'Petite Entreprise', color: '#3498db' };
        if (ca >= 90000 && ca < 400000) return { label: 'Moyenne Entreprise', color: '#f39c12' };
        if (ca >= 400000) return { label: 'Grande Entreprise', color: '#e74c3c' };
        return null;
    })();

    return (
        <div className="declaration-pme-container" style={{ minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7f8fa', padding: '0.5vw 0' }}>
            <div style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                padding: 0,
                width: '100%',
                maxWidth: 600,
                margin: '1rem auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                animation: 'fadeIn 0.7s',
                minHeight: '60vh',
                position: 'relative',
            }}>
                {/* Bandeau supérieur */}
                <div style={{
                    width: '100%',
                    background: '#f7f8fa',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    padding: '0.7rem 2vw 0.4rem 2vw',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    borderBottom: '1px solid #ececec',
                }}>
                    <h2 style={{ color: '#222', margin: 0, fontSize: '2rem', fontWeight: 700, letterSpacing: 0.1, flex: 1, textAlign: 'center' }}>Déclaration PME</h2>
                    <button className="btn-secondary" onClick={onLogout} style={{ background: '#f7f8fa', color: '#444', border: '1px solid #ececec', borderRadius: 4, fontWeight: 500, fontSize: 12, padding: '0.15rem 0.5rem', boxShadow: 'none', transition: 'background 0.2s', cursor: 'pointer', position: 'absolute', right: 16, top: 12 }}>Déconnexion</button>
                </div>
                {/* Progression */}
                <div className="progress-bar-animated" style={{ width: '100%', margin: '0 0 6px 0', padding: '0 2vw', boxSizing: 'border-box' }}>
                    <div className="progress-bar-bg" style={{ height: 4, borderRadius: 2, background: '#ececec' }}>
                        <div className="progress-bar-fill" style={{ width: `${progress}%`, background: '#bfc9d1', height: 4, borderRadius: 2, transition: 'width 0.4s' }} />
                    </div>
                    <div className="progress-bar-label" style={{ fontWeight: 500, color: '#888', marginTop: 1, fontSize: 11, textAlign: 'center' }}>{progress}%</div>
                </div>
                {/* Formulaire */}
                <form className="declaration-form" onSubmit={handleSubmit} style={{
                    width: '100%',
                    background: 'none',
                    boxShadow: 'none',
                    padding: '0 2vw 0.7rem 2vw',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0,
                    flex: 1,
                    boxSizing: 'border-box',
                }}>
                    <div className="step-illustration" style={{ width: '100%', textAlign: 'center', marginBottom: 2 }}>
                        {step.illustration && <img src={step.illustration} alt="Étape" style={{ width: 22, height: 'auto', opacity: 0.6, animation: 'bounceIn 0.7s' }} />}
                    </div>
                    <h4 style={{ margin: '0 0 2px 0', color: '#222', fontWeight: 600, fontSize: '0.92rem', letterSpacing: 0.05, textAlign: 'center', width: '100%' }}>{step.label}</h4>
                    <p className="step-description" style={{ color: '#666', fontSize: 11, marginBottom: 6, textAlign: 'center', maxWidth: '100%', fontWeight: 400 }}>{step.description}</p>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: window.innerWidth > 700 ? '1fr 1fr' : '1fr',
                            gap: 50,
                            width: '90%',
                            alignItems: 'stretch',
                            marginBottom: 20,
                            minHeight: 40,
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Champs classiques */}
                        {step.fields && step.fields.map((field, idx, arr) => (
                            field === 'justificatif' ? (
                                <div key={field} className="form-group" style={{ gridColumn: '1 / -1', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', marginBottom: 1 }}>
                                    <label style={{ marginBottom: 1, fontWeight: 500, color: '#444', fontSize: 10 }}>Document justificatif :</label>
                                    <FileDropUpload
                                        name={field}
                                        file={files[field]}
                                        onFileChange={handleFile}
                                        onRemove={() => setFiles(f => ({ ...f, [field]: undefined }))}
                                    />
                                </div>
                            ) : (
                                <div key={field} className="form-group" style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', marginBottom: 1, gridColumn: arr.length === 1 ? '1 / -1' : undefined }}>
                                    <label style={{ marginBottom: 1, fontWeight: 500, color: '#444', fontSize: 10 }}>{field === 'nomEntreprise' ? "Nom de l'entreprise" : field === 'anneeFiscale' ? 'Année fiscale' : field === 'chiffreAffaires' ? 'Chiffre d’affaires' : 'Charges'} :</label>
                                    <input type={field === 'anneeFiscale' ? 'number' : 'text'} name={field} value={form[field] || ''} onChange={handleChange} required style={{ width: '100%', minWidth: 0, padding: '0.22rem', border: '1px solid #ececec', borderRadius: 3, marginBottom: 1, fontSize: 10, background: '#fafbfc', fontWeight: 400, color: '#222' }} />
                                    {field === 'chiffreAffaires' && nomenclature && (
                                        <div style={{ marginTop: 1, fontWeight: 600, color: '#888', background: '#f7f8fa', borderRadius: 2, padding: '0.08rem 0.2rem', fontSize: 9, animation: 'fadeIn 0.5s', border: '1px solid #ececec', width: 'fit-content' }}>
                                            {nomenclature.label}
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                        {/* Champs upload multiples */}
                        {step.uploads && step.uploads.map((upload, idx, arr) => (
                            <div key={upload.name} className="form-group" style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', marginBottom: 1, gridColumn: arr.length === 1 ? '1 / -1' : undefined }}>
                                <label style={{ marginBottom: 1, fontWeight: 500, color: '#444', fontSize: 10 }}>{upload.label} :</label>
                                <FileDropUpload
                                    name={upload.name}
                                    file={files[upload.name]}
                                    onFileChange={handleFile}
                                    onRemove={() => setFiles(f => ({ ...f, [upload.name]: undefined }))}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Ajout d'un bouton pour télécharger le PDF des conditions */}
                    <div style={{ width: '100%', textAlign: 'center', margin: '18px 0 8px 0' }}>
                        <a
                            href={dgiPdf}
                            download="Conditions-et-documents-DGI.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                background: '#3498db',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: 15,
                                borderRadius: 7,
                                padding: '0.5rem 1.5rem',
                                textDecoration: 'none',
                                boxShadow: '0 1px 8px #e3eafc',
                                marginBottom: 8
                            }}
                        >
                            📄 Télécharger les conditions et documents exigés
                        </a>
                    </div>
                    {/* Ajout d'une case à cocher pour accepter les conditions avant soumission */}
                    <div style={{ width: '100%', margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            required
                            style={{ accentColor: '#3498db', width: 16, height: 16 }}
                        />
                        <label htmlFor="acceptTerms" style={{ fontSize: 13, color: '#444', fontWeight: 500 }}>
                            J'ai lu et j'accepte les conditions et les termes du système DGI
                        </label>
                    </div>
                    <div className="form-navigation" style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginTop: 5, width: '100%' }}>
                        {currentStep > 0 && <button type="button" className="btn-secondary" onClick={prev} style={{ fontSize: 10, padding: '0.15rem 0.5rem', borderRadius: 3, fontWeight: 500, background: '#f7f8fa', color: '#444', border: '1px solid #ececec', boxShadow: 'none', transition: 'background 0.2s' }}>Précédent</button>}
                        {currentStep < steps.length - 1 && <button type="button" className="btn-primary" onClick={next} style={{ fontSize: 10, padding: '0.15rem 0.5rem', borderRadius: 3, background: '#ececec', color: '#444', border: 'none', fontWeight: 600, boxShadow: 'none', transition: 'background 0.2s' }}>Suivant</button>}
                        {currentStep === steps.length - 1 && <button type="submit" className="btn-success" style={{ fontSize: 10, padding: '0.15rem 0.5rem', borderRadius: 3, background: '#ececec', color: '#444', border: 'none', fontWeight: 600, boxShadow: 'none', transition: 'background 0.2s' }}>Soumettre</button>}
                    </div>
                    {submitted && <div className="success-message" style={{ marginTop: 4, fontSize: 11, color: '#27ae60', fontWeight: 600, background: '#f7f8fa', borderRadius: 3, padding: '0.15rem 0.4rem', boxShadow: 'none', textAlign: 'center' }}>Déclaration soumise ! 🎉</div>}
                </form>
            </div>
        </div>
    );
};

// Nouveau composant drag & drop + actions
const FileDropUpload = ({ name, file, onFileChange, onRemove }) => {
    const fileInput = React.useRef();
    const [dragActive, setDragActive] = React.useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const fakeEvt = { target: { name, files: e.dataTransfer.files } };
            onFileChange(fakeEvt);
        }
    };
    return (
        <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
            onDrop={handleDrop}
            style={{
                border: dragActive ? '2px solid #3498db' : '2px dashed #b3c6e0',
                background: dragActive ? '#eaf6ff' : '#f5f7fa',
                borderRadius: 10,
                padding: '1.1rem 1.2rem',
                width: '100%',
                minHeight: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 6,
                transition: 'border 0.2s, background 0.2s',
                position: 'relative',
            }}
        >
            <img src={uploadImg} alt="Upload" style={{ width: 34, opacity: 0.7 }} />
            <div style={{ flex: 1 }}>
                {!file && <span style={{ color: '#3498db', fontWeight: 500, cursor: 'pointer' }} onClick={() => fileInput.current.click()}>Glissez-déposez ou cliquez pour choisir un fichier</span>}
                {file && (
                    <span style={{ color: '#27ae60', fontWeight: 500, fontSize: 15 }}>
                        📄 {file.name}
                    </span>
                )}
            </div>
            <input
                ref={fileInput}
                id={name}
                type="file"
                name={name}
                onChange={onFileChange}
                style={{ display: 'none' }}
            />
            {file && (
                <div style={{
                    display: 'flex',
                    position: "relative",
                    gap: "27px",
                    Top: "33pX",
                    alignItems: "center",
                    Left: "-160px",
                    opacity: "0.5"
                }}>
                    <button type="button" title="Modifier" onClick={() => fileInput.current.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3498db', fontSize: 18 }}>✏️</button>
                    <button type="button" title="Supprimer" onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: 18 }}>🗑️</button>
                    <a href={URL.createObjectURL(file)} download={file.name} title="Télécharger" style={{ color: '#27ae60', fontSize: 18, textDecoration: 'none' }}>⬇️</a>
                </div>
            )}
        </div>
    );
};

export default DeclarationPME;
