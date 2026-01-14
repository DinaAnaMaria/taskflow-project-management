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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`, { headers });
            setUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/create-user`, formData, { headers });
            alert("Utilizator creat!");
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'executant', managerId: '' });
            fetchUsers();
        } catch (err) { alert("Eroare: " + err.response?.data?.error); }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ marginBottom: '30px' }}>⚙️ Administrare Sistem</h2>

            {/* FORMULAR CREARE USER */}
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                <h4>Adaugă Utilizator Nou</h4>
                <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                    <input type="text" placeholder="Prenume" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required style={s.input}/>
                    <input type="text" placeholder="Nume" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required style={s.input}/>
                    <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={s.input}/>
                    <input type="password" placeholder="Parolă" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={s.input}/>
                    
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={s.input}>
                        <option value="executant">Executant</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>

                    {/* CERINȚĂ: Un utilizator care nu este manager are un manager alocat */}
                    <select 
                        value={formData.managerId} 
                        onChange={e => setFormData({...formData, managerId: e.target.value})} 
                        style={s.input}
                        required={formData.role === 'executant'}
                    >
                        <option value="">Alocă un Manager...</option>
                        {users.filter(u => u.role === 'manager').map(m => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                    </select>

                    <button type="submit" style={s.btn}>Creează Utilizator</button>
                </form>
            </div>

            {/* LISTĂ UTILIZATORI */}
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h4>Utilizatori existenți</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                            <th style={s.th}>Nume</th>
                            <th style={s.th}>Rol</th>
                            <th style={s.th}>Manager ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={s.td}>{u.firstName} {u.lastName}</td>
                                <td style={s.td}><span style={s.badge}>{u.role}</span></td>
                                <td style={s.td}>{u.managerId || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const s = {
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' },
    btn: { gridColumn: '1 / span 2', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    th: { padding: '12px', color: '#64748b', fontSize: '13px' },
    td: { padding: '12px', fontSize: '14px' },
    badge: { backgroundColor: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }
};

export default AdminPanel;