import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', formData);
      localStorage.setItem('token', res.data.token); // Salvăm cheia de acces
      alert('Te-ai logat cu succes!');
      navigate('/dashboard'); // Mergem la pagina principală
    } catch (err) {
      alert('Eroare: ' + (err.response?.data?.error || 'Date greșite'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Logare</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input type="password" name="password" placeholder="Parola" onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', width: '100%', background: 'blue', color: 'white', border: 'none' }}>Intră în cont</button>
      </form>
    </div>
  );
}
export default Login;