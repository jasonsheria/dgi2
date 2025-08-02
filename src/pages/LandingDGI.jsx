import React from 'react';
import { useNavigate } from 'react-router-dom';
import dgiLogo from '../assets/dgi-logo.png'; // Placez un logo DGI ici
import fiscalIllustration from '../assets/undraw_chat-with-ai_ir62.svg'; // Placez une illustration ici
import background from '../assets/istockphoto-1447397756-612x612.jpg'; // Placez une image de fond ici
const LandingDGI = () => {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e3eafc 0%, #f7f8fa 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ background: 'rgb(255 255 255 / 81%)', borderRadius: 18, boxShadow: '0 4px 32px #e3eafc', height: '100vh', width: '100vw', textAlign: 'center', position: 'relative' }}>
                <div style={{display : 'flex', alignitems : 'center', margin : 20}}>
                    <img src={dgiLogo} alt="Logo DGI" style={{ width:130, marginBottom: 10, paddingTop: '15px' }} />
                    <h1 style={{ color: '#003366', fontWeight: 800, fontSize: '40px', marginLeft : '7%',marginBottom: 18, letterSpacing: 1 }}> 
                        REPUBLIQUE DEMOCRATIQUE DU CONGO <br/>
                        e-fiscalitis DGI
                    </h1>

                </div>

                <img src={fiscalIllustration} alt="Illustration fiscale" style={{ width: '70%', maxWidth: 260, margin: '0 auto 18px auto', display: 'block', borderRadius: 10 }} />
                <p style={{ color: 'rgb(0, 51, 102)', fontSize: 18, marginBottom: 28, fontWeight: 700 }}>
                    Plateforme de déclaration et de gestion fiscale pour Les entreprises, Inspecteurs et Administrateurs.<br />
                    Simplifiez la fiscalité, accélérez la conformité.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    style={{ background: 'linear-gradient(90deg, #3498db 60%, #003366 100%)', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '0.7rem 2.5rem', cursor: 'pointer', boxShadow: '0 2px 8px #e3eafc', transition: 'background 0.2s' }}
                >
                    Commencer
                </button>
                <div style={{ marginTop: 40, color: '#888', fontSize: 14, letterSpacing: 0.5 }}>
                    © {new Date().getFullYear()} Direction Générale des Impôts
                </div>
            </div>

        </div>
    );
};

export default LandingDGI;
