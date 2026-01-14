import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', password: '', role: 'executant', managerId: '' 
  });
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');
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
      alert("✅ Utilizator creat cu succes!");
      fetchData();
    } catch (err) {
      alert("❌ Eroare: " + err.response?.data?.error);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Funcție pentru culorile statusurilor
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#3498db'; // Albastru
      case 'PENDING': return '#f1c40f'; // Galben
      case 'COMPLETED': return '#2ecc71'; // Verde
      case 'CLOSED': return '#95a5a6'; // Gri
      default: return '#000';
    }
  };

  return (
    <div style={styles.container}>
      {/* --- HEADER --- */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>TaskFlow Dashboard</h1>
          <p style={styles.subtitle}>Logat ca: <strong>{user.name}</strong> ({user.role})</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.content}>
        {/* --- SECȚIUNE ADMIN: Creare Utilizator --- */}
        {user.role === 'admin' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>➕ Adaugă Utilizator Nou</h2>
            <form onSubmit={handleCreateUser} style={styles.form}>
              <div style={styles.inputGroup}>
                <input style={styles.input} placeholder="Prenume" onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <input style={styles.input} placeholder="Nume" onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <input style={styles.input} placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input style={styles.input} placeholder="Parolă" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <select style={styles.select} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="executant">Rol: Executant</option>
                <option value="manager">Rol: Manager</option>
              </select>

              {formData.role === 'executant' && (
                <select style={styles.select} onChange={e => setFormData({...formData, managerId: e.target.value})}>
                  <option value="">Alege Managerul...</option>
                  {users.filter(u => u.role === 'manager').map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              )}
              <button type="submit" style={styles.submitBtn}>Creează Cont</button>
            </form>
          </div>
        )}

        {/* --- SECȚIUNE TASK-URI --- */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Task-uri Active</h2>
          <div style={styles.taskList}>
            {tasks.length > 0 ? tasks.map(t => (
              <div key={t.id} style={styles.taskItem}>
                <div>
                  <div style={styles.taskTitle}>{t.title}</div>
                  <div style={styles.taskDesc}>{t.description}</div>
                </div>
                <div style={{...styles.statusBadge, backgroundColor: getStatusColor(t.status)}}>
                  {t.status}
                </div>
              </div>
            )) : <p>Nu există task-uri de afișat.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STILURI CSS-in-JS ---
const styles = {
  container: { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' },
  title: { margin: 0, color: '#2c3e50' },
  subtitle: { margin: '5px 0 0', color: '#7f8c8d' },
  logoutBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  content: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  cardTitle: { marginTop: 0, borderBottom: '2px solid #f4f7f6', paddingBottom: '10px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  inputGroup: { display: 'flex', gap: '10px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' },
  select: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: '#fff' },
  submitBtn: { backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' },
  taskTitle: { fontWeight: 'bold', color: '#2c3e50' },
  taskDesc: { fontSize: '12px', color: '#7f8c8d' },
  statusBadge: { color: '#fff', padding: '5px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }
};

export default Dashboard;