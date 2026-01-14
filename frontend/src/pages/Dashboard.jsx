import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', password: '', role: 'executant', managerId: '' 
  });
  
  // Preluăm datele userului logat din localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');
  
  // CONFIGURARE URL - Asigură-te că e adresa ta de Render
  const API_URL = "https://taskflow-api-qkmb.onrender.com/api";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resTasks = await axios.get(`${API_URL}/projects`, { headers });
      const allTasks = resTasks.data.flatMap(p => p.Tasks || []);
      setTasks(allTasks);

      if (user.role === 'admin' || user.role === 'manager') {
        const resUsers = await axios.get(`${API_URL}/users`, { headers });
        setUsers(resUsers.data);
      }
    } catch (err) {
      console.error("Eroare la încărcarea datelor:", err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/create-user`, formData, { headers });
      alert("Utilizator creat cu succes!");
      fetchData(); // Refresh listă
    } catch (err) {
      alert("Eroare la creare: " + err.response?.data?.error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard - Salut, {user.name || 'Utilizator'}!</h1>
      <p>Rol: <strong>{user.role}</strong></p>

      {/* SECȚIUNE DOAR PENTRU ADMIN - Creare Utilizatori */}
      {user.role === 'admin' && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h2>Adaugă Utilizator Nou</h2>
          <form onSubmit={handleCreateUser}>
            <input placeholder="Prenume" onChange={e => setFormData({...formData, firstName: e.target.value})} />
            <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
            <input placeholder="Parolă" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
            
            <select onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="executant">Executant</option>
              <option value="manager">Manager</option>
            </select>

            {formData.role === 'executant' && (
              <select onChange={e => setFormData({...formData, managerId: e.target.value})}>
                <option value="">Alege Manager...</option>
                {users.filter(u => u.role === 'manager').map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            )}
            <button type="submit">Creează</button>
          </form>
        </div>
      )}

      {/* LISTA DE TASK-URI */}
      <h2>Task-urile mele / Proiecte</h2>
      <div className="task-list">
        {tasks.length > 0 ? tasks.map(t => (
          <div key={t.id} style={{ border: '1px solid #ddd', margin: '10px 0', padding: '10px' }}>
            {t.title} - <strong>{t.status}</strong>
          </div>
        )) : <p>Nu există task-uri de afișat.</p>}
      </div>
    </div>
  );
};


export default Dashboard;