import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Acum serverul va răspunde corect la această adresă
      await axios.post('http://localhost:8080/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la înregistrare. Verifică datele.');
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" 
         style={{ minHeight: 'calc(100vh - 70px)', background: '#f3f4f6' }}>
      
      <div className="modern-card p-5 mb-5" style={{ width: '100%', maxWidth: '500px' }}>
        
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle mb-3" style={{ width: 56, height: 56 }}>
            <i className="bi bi-person-plus-fill fs-4"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">Creează Cont</h3>
          <p className="text-muted small">Începe să organizezi proiectele echipei tale.</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-4 small text-center border-0 bg-danger-subtle text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
                <label className="form-label small text-muted fw-bold" style={{fontSize: '0.75rem'}}>PRENUME</label>
                <input type="text" name="firstName" className="input-modern" onChange={handleChange} required />
            </div>
            <div className="col-md-6">
                <label className="form-label small text-muted fw-bold" style={{fontSize: '0.75rem'}}>NUME</label>
                <input type="text" name="lastName" className="input-modern" onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small text-muted fw-bold" style={{fontSize: '0.75rem'}}>EMAIL</label>
            <input type="email" name="email" className="input-modern" onChange={handleChange} required />
          </div>

          <div className="mb-4">
            <label className="form-label small text-muted fw-bold" style={{fontSize: '0.75rem'}}>PAROLA</label>
            <input type="password" name="password" className="input-modern" onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-primary-modern w-100 py-3 mb-3 fw-bold" style={{fontSize: '0.95rem'}}>
            Înregistrează-te Gratuit
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-muted small mb-0">
            Ai deja cont? <Link to="/login" className="text-primary fw-bold text-decoration-none ms-1">Loghează-te aici</Link>
          </p>
        </div>

      </div>
      
      <div className="text-center text-muted opacity-75" style={{ fontSize: '0.8rem' }}>
        &copy; 2026 TaskFlow Enterprise.
      </div>
    </div>
  );
}

export default Register;