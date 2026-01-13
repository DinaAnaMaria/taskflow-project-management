import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Nu lăsăm pagina să-și dea refresh
    try {
      // Trimitem datele la server
      const response = await axios.post('http://localhost:8080/api/auth/register', formData);
      alert('Succes: ' + response.data.message);
    } catch (error) {
      alert('Eroare: ' + (error.response?.data?.error || 'Ceva nu a mers!'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Crează Cont</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input type="text" name="firstName" placeholder="Prenume" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="text" name="lastName" placeholder="Nume" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="password" name="password" placeholder="Parola" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
          Înregistrează-te
        </button>
      </form>
    </div>
  );
}

export default Register;