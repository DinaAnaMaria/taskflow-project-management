import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');
  const API_URL = "https://taskflow-api-qkmb.onrender.com/api";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resP = await axios.get(`${API_URL}/projects`, { headers });
      const allTasks = resP.data.flatMap(p => p.Tasks || []);
      setTasks(allTasks);

      if (user.role === 'admin' || user.role === 'manager') {
        const resU = await axios.get(`${API_URL}/users`, { headers });
        setUsers(resU.data);
      }
    } catch (err) {
      console.error("Eroare la incarcare:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (taskId, execId) => {
    if(!execId) return;
    await axios.put(`${API_URL}/tasks/${taskId}/assign`, { assignedTo: execId }, { headers });
    alert("🚀 Task alocat cu succes!");
    fetchData();
  };

  const handleAction = async (taskId, action) => {
    await axios.put(`${API_URL}/tasks/${taskId}/${action}`, {}, { headers });
    fetchData();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return { color: '#3498db', bg: '#ebf5fb' };
      case 'PENDING': return { color: '#f39c12', bg: '#fef5e7' };
      case 'COMPLETED': return { color: '#2ecc71', bg: '#eafaf1' };
      case 'CLOSED': return { color: '#7f8c8d', bg: '#f2f4f4' };
      default: return { color: '#000', bg: '#fff' };
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Se încarcă...</div>;

  return (
    <div style={s.container}>
      {/* --- TOP BAR --- */}
      <nav style={s.navbar}>
        <h2 style={s.logo}>TaskFlow <span>Pro</span></h2>
        <div style={s.userInfo}>
          <div style={s.userBadge}>{user.role?.charAt(0).toUpperCase()}</div>
          <span style={{marginRight:'15px'}}><strong>{user.name || user.firstName}</strong></span>
          <button onClick={() => {localStorage.clear(); window.location.href='/login'}} style={s.logoutBtn}>Ieșire</button>
        </div>
      </nav>

      <div style={s.content}>
        {/* --- STATS / CONTROL PANEL --- */}
        {(user.role === 'admin' || user.role === 'manager') && (
          <div style={s.sidebar}>
            <h3 style={s.sectionTitle}>Echipa Mea</h3>
            <div style={s.userList}>
              {users.map(u => (
                <div key={u.id} style={s.userItem}>
                  <div style={s.dot}></div>
                  <span>{u.firstName} {u.lastName} <small style={{display:'block', color:'#999'}}>{u.role}</small></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MAIN TASK AREA --- */}
        <div style={s.main}>
          <h3 style={s.sectionTitle}>Fluxul de Lucru</h3>
          <div style={s.taskGrid}>
            {tasks.map(t => {
              const style = getStatusStyle(t.status);
              return (
                <div key={t.id} style={s.taskCard}>
                  <div style={{...s.statusTag, color: style.color, backgroundColor: style.bg}}>{t.status}</div>
                  <h4 style={s.taskTitle}>{t.title}</h4>
                  <p style={s.taskDesc}>{t.description}</p>
                  
                  <div style={s.actions}>
                    {/* MANAGER: ALOCARE */}
                    {user.role === 'manager' && t.status === 'OPEN' && (
                      <select onChange={(e) => handleAssign(t.id, e.target.value)} style={s.select}>
                        <option value="">Alege executant</option>
                        {users.filter(u => u.role === 'executant').map(u => (
                          <option key={u.id} value={u.id}>{u.firstName}</option>
                        ))}
                      </select>
                    )}

                    {/* EXECUTANT: FINALIZEAZA */}
                    {user.role === 'executant' && t.status === 'PENDING' && (
                      <button onClick={() => handleAction(t.id, 'complete')} style={s.btnDone}>Finalizează</button>
                    )}

                    {/* MANAGER: INCHIDE */}
                    {user.role === 'manager' && t.status === 'COMPLETED' && (
                      <button onClick={() => handleAction(t.id, 'close')} style={s.btnClose}>Închide Task</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STILURI (PROFESSIONAL DESIGN) ---
const s = {
  container: { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 40px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' },
  logo: { color: '#1a73e8', margin: 0, letterSpacing: '-1px' },
  userInfo: { display: 'flex', alignItems: 'center' },
  userBadge: { width: '35px', height: '35px', backgroundColor: '#1a73e8', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', fontWeight: 'bold' },
  logoutBtn: { padding: '7px 15px', backgroundColor: '#fff', border: '1px solid #dcdfe3', borderRadius: '5px', cursor: 'pointer', transition: '0.3s' },
  content: { display: 'flex', padding: '30px', gap: '30px' },
  sidebar: { width: '250px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' },
  main: { flex: 1 },
  sectionTitle: { marginTop: 0, marginBottom: '20px', color: '#444', fontSize: '18px' },
  userList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  userItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' },
  dot: { width: '8px', height: '8px', backgroundColor: '#2ecc71', borderRadius: '50%' },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  taskCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative', border: '1px solid #f0f0f0' },
  statusTag: { position: 'absolute', top: '15px', right: '15px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  taskTitle: { margin: '10px 0 5px 0', fontSize: '16px', color: '#333' },
  taskDesc: { fontSize: '13px', color: '#777', marginBottom: '20px', lineHeight: '1.4' },
  actions: { borderTop: '1px solid #eee', paddingTop: '15px' },
  select: { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none' },
  btnDone: { width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnClose: { width: '100%', padding: '10px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};

export default Dashboard;