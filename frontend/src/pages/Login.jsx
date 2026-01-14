import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://taskflow-api-qkmb.onrender.com/api/auth/login', formData);
      
      // 1. Salvezi token-ul pentru autorizarea cererilor API viitoare
      localStorage.setItem('token', res.data.token);
      
      // 2. MODIFICAREA CRITICĂ: Salvezi obiectul 'user' primit de la server
      // Acest pas este obligatoriu pentru ca Dashboard-ul să poată afișa numele și să știe rolul tău
      localStorage.setItem('user', JSON.stringify(res.data.user)); 
      
      // 3. Redirecționezi utilizatorul către Dashboard
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Date incorecte.');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" 
         style={{ minHeight: 'calc(100vh - 70px)', background: '#f3f4f6' }}>
      
      <div className="modern-card p-5 mb-5" style={{ width: '100%', maxWidth: '440px' }}>
        
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle mb-3" style={{ width: 56, height: 56 }}>
            <i className="bi bi-person-lock fs-4"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">Bine ai revenit</h3>
          <p className="text-muted small">Introdu datele pentru a accesa contul.</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-4 small text-center border-0 bg-danger-subtle text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label small text-muted fw-bold" style={{fontSize: '0.75rem'}}>EMAIL</label>
            <input 
              type="email" 
              name="email" 
              className="input-modern" 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
                <label className="form-label small text-muted fw-bold" style={{fontSize: '0.75rem'}}>PAROLA</label>
                <Link to="/forgot-password" title="Recuperare parolă" className="small text-primary text-decoration-none fw-medium">
                    Ai uitat parola?
                </Link>
            </div>
            <input 
              type="password" 
              name="password" 
              className="input-modern" 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary-modern w-100 py-3 mb-3 fw-bold">
            Autentificare
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-muted small mb-0">
            Nu ai cont? <Link to="/register" className="text-primary fw-bold text-decoration-none ms-1">Creează unul acum</Link>
          </p>
        </div>
      </div>

      <div className="text-center text-muted opacity-75 small">
        &copy; 2026 TaskFlow Enterprise.
      </div>
    </div>
  );
}

export default Login;