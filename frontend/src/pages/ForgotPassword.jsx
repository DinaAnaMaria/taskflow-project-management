import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setError(''); setLoading(true);
        
        try {
            await axios.post('https://taskflow-api-qkmb.onrender.com/api/auth/forgot-password', { email });
            setMessage('Email trimis cu succes! Verifică inbox-ul (și folderul Spam).');
        } catch (err) {
            setError(err.response?.data?.error || 'Eroare la trimiterea emailului.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            <div className="modern-card p-5" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle mb-3" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-envelope-at-fill fs-4"></i>
                    </div>
                    <h3 className="fw-bold text-dark">Recuperare Parolă</h3>
                    <p className="text-muted small">Îți vom trimite un link de resetare pe email.</p>
                </div>

                {message ? (
                    <div className="alert alert-success text-center">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger small">{error}</div>}
                        
                        <div className="mb-4">
                            <label className="form-label small text-muted fw-bold">EMAIL</label>
                            <input type="email" className="input-modern" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <button disabled={loading} className="btn-primary-modern w-100 py-3 mb-3">
                            {loading ? 'Se trimite...' : 'Trimite Email Resetare'}
                        </button>
                    </form>
                )}

                <div className="text-center pt-2">
                    <Link to="/login" className="text-decoration-none small text-muted">
                        <i className="bi bi-arrow-left"></i> Înapoi la Logare
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;