import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
    const { token } = useParams(); // Luăm codul secret din URL
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) return setError('Parolele nu coincid.');
        
        try {
            await axios.post('https://taskflow-api-qkmb.onrender.com/api/auth/reset-password', { 
                token, 
                newPassword: passwords.new 
            });
            alert('Parolă schimbată cu succes! Te poți loga acum.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Link expirat sau invalid.');
        }
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            <div className="modern-card p-5" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-shield-lock-fill fs-4"></i>
                    </div>
                    <h3 className="fw-bold text-dark">Parolă Nouă</h3>
                    <p className="text-muted small">Alege o parolă sigură.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger small">{error}</div>}
                    
                    <div className="mb-3">
                        <label className="form-label small text-muted fw-bold">PAROLA NOUĂ</label>
                        <input type="password" className="input-modern" 
                            onChange={e => setPasswords({...passwords, new: e.target.value})} required />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small text-muted fw-bold">CONFIRMĂ PAROLA</label>
                        <input type="password" className="input-modern" 
                            onChange={e => setPasswords({...passwords, confirm: e.target.value})} required />
                    </div>

                    <button className="btn-primary-modern w-100 py-3">Schimbă Parola</button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;