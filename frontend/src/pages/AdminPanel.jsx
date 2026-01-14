import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'executant', managerId: ''
    });

    const API_URL = "https://taskflow-api-qkmb.onrender.com/api";
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`, { headers });
            setUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Pregătim datele pentru trimitere
    const payload = {
        ...formData,
        // Dacă managerId este un text gol, îl convertim în null, altfel baza de date dă eroare
        managerId: formData.managerId === "" ? null : formData.managerId
    };

    try {
        await axios.post(`${API_URL}/admin/create-user`, payload, { headers });
        alert("Utilizator creat cu succes!");
        setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'executant', managerId: '' });
        fetchUsers();
    } catch (err) { 
        alert("Eroare: " + (err.response?.data?.error || err.message)); 
    }
};

    return (
        <div style={s.adminContainer}>
            <header style={s.header}>
                <h2 style={s.title}>⚙️ Panou Administrare</h2>
                <p style={s.subtitle}>Gestionează ierarhia și utilizatorii sistemului</p>
            </header>

            <div style={s.grid}>
                {/* FORMULAR */}
                <div style={s.glassCard}>
                    <h3 style={s.cardTitle}>Adaugă Membru Nou</h3>
                    <form onSubmit={handleCreateUser} style={s.form}>
                        <div style={s.row}>
                            <input type="text" placeholder="Prenume" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required style={s.input}/>
                            <input type="text" placeholder="Nume" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required style={s.input}/>
                        </div>
                        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={s.input}/>
                        <input type="password" placeholder="Parolă" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={s.input}/>
                        
                        <label style={s.label}>Rol Sistem:</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={s.input}>
                            <option value="executant">Executant</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>

                        {formData.role === 'executant' && (
                            <>
                                <label style={s.label}>Manager Responsabil (Obligatoriu):</label>
                                <select 
                                    value={formData.managerId} 
                                    onChange={e => setFormData({...formData, managerId: e.target.value})} 
                                    style={{...s.input, border: '1px solid #4318FF'}}
                                    required
                                >
                                    <option value="">Selectează managerul...</option>
                                    {users.filter(u => u.role === 'manager').map(m => (
                                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        <button type="submit" style={s.primaryBtn}>Creează Cont</button>
                    </form>
                </div>

                {/* TABEL */}
                <div style={s.glassCard}>
                    <h3 style={s.cardTitle}>Membri Activi</h3>
                    <div style={s.tableWrap}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>NUME COMPLET</th>
                                    <th style={s.th}>ROL</th>
                                    <th style={s.th}>MANAGER ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={s.tr}>
                                        <td style={s.td}>{u.firstName} {u.lastName}</td>
                                        <td style={s.td}><span style={s.badge}>{u.role}</span></td>
                                        <td style={s.td}>{u.managerId || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const s = {
    adminContainer: { padding: '50px', backgroundColor: '#f4f7fe', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: '800', color: '#1b2559' },
    subtitle: { color: '#a3aed0', fontWeight: '500' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' },
    glassCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0px 20px 40px rgba(0,0,0,0.03)' },
    cardTitle: { marginBottom: '20px', fontSize: '18px', fontWeight: '700' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    input: { padding: '12px', borderRadius: '12px', border: '1px solid #e0e5f2', outline: 'none' },
    label: { fontSize: '12px', fontWeight: '700', color: '#4318FF', marginTop: '5px' },
    primaryBtn: { padding: '15px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' },
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px', color: '#a3aed0', fontSize: '11px', fontWeight: '700', borderBottom: '1px solid #f4f7fe' },
    tr: { borderBottom: '1px solid #f4f7fe' },
    td: { padding: '15px', fontSize: '14px', fontWeight: '600', color: '#1b2559' },
    badge: { backgroundColor: '#eef2ff', color: '#4318FF', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }
};

export default AdminPanel;