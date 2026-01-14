import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview | mytasks
    const [loading, setLoading] = useState(true);

    // Citim datele din LocalStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const token = localStorage.getItem('token');
    
    // URL-ul tău de Render
    const API_URL = "https://taskflow-api-qkmb.onrender.com/api"; 
    const headers = { Authorization: `Bearer ${token}` };

    // Numele afișat (fără undefined)
    const displayName = user.firstName || user.name || "Utilizator";

    useEffect(() => {
        if (!token) window.location.href = '/login';
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Preluăm proiectele (care conțin task-urile)
            const resProj = await axios.get(`${API_URL}/projects`, { headers });
            setProjects(resProj.data);

            // 2. Preluăm echipa (doar dacă nu ești simplu executant)
            if (user.role !== 'executant') {
                const resUsers = await axios.get(`${API_URL}/users`, { headers });
                setUsers(resUsers.data);
            }
        } catch (err) {
            console.error("Eroare la încărcarea datelor:", err);
        }
        setLoading(false);
    };

    // Funcție pentru acțiunile pe task (Alocare, Finalizare, Închidere)
    const handleAction = async (taskId, action, body = {}) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/${action}`, body, { headers });
            fetchData(); // Refresh listă
        } catch (err) {
            alert(err.response?.data?.error || "Eroare la procesarea task-ului");
        }
    };

    const getStatusStyle = (status) => {
        const colors = {
            'OPEN': { color: '#3b82f6', bg: '#eff6ff', label: 'Deschis' },
            'PENDING': { color: '#f59e0b', bg: '#fffbeb', label: 'În Lucru' },
            'COMPLETED': { color: '#10b981', bg: '#ecfdf5', label: 'Finalizat' },
            'CLOSED': { color: '#64748b', bg: '#f1f5f9', label: 'Închis' }
        };
        return colors[status] || colors['OPEN'];
    };

    // Extragem toate task-urile din proiecte pentru a le afișa în feed
    const allTasks = projects.flatMap(p => p.Tasks || []);

    return (
        <div style={s.container}>
            {/* SIDEBAR */}
            <aside style={s.sidebar}>
                <div style={s.logoArea}>
                    <div style={s.logoIcon}>TF</div>
                    <span style={s.logoText}>TaskFlow<span style={{color:'#3b82f6'}}>Pro</span></span>
                </div>
                
                <nav style={s.nav}>
                    <button 
                        style={activeTab === 'overview' ? s.navActive : s.navBtn} 
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Privire de ansamblu
                    </button>
                    <button 
                        style={activeTab === 'mytasks' ? s.navActive : s.navBtn} 
                        onClick={() => setActiveTab('mytasks')}
                    >
                        ✅ Sarcinile Mele
                    </button>
                </nav>

                <div style={s.userBox}>
                    <div style={s.avatar}>{displayName.charAt(0)}</div>
                    <div style={{overflow:'hidden'}}>
                        <div style={s.uName}>{displayName}</div>
                        <div style={s.uRole}>{user.role?.toUpperCase()}</div>
                    </div>
                    <button onClick={() => {localStorage.clear(); window.location.href='/login'}} style={s.logout}>✕</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={s.main}>
                <header style={s.header}>
                    <h1 style={s.title}>
                        {activeTab === 'overview' ? `Salutare, ${displayName}!` : "Lista Mea de Lucru"}
                    </h1>
                    <p style={s.subtitle}>
                        {activeTab === 'overview' ? "Toate activitățile din sistem." : "Sarcini alocate ție personal."}
                    </p>
                </header>

                <div style={s.statsRow}>
                    <div style={s.statCard}>
                        <span style={s.statLabel}>Task-uri Active</span>
                        <div style={s.statValue}>{allTasks.filter(t => t.status !== 'CLOSED').length}</div>
                    </div>
                    <div style={s.statCard}>
                        <span style={s.statLabel}>Echipa Ta</span>
                        <div style={s.statValue}>{users.length}</div>
                    </div>
                </div>

                <div style={s.card}>
                    <h3 style={{marginBottom:'20px'}}>Flux Activitate</h3>
                    <div style={s.list}>
                        {allTasks
                            .filter(t => activeTab === 'mytasks' ? t.assignedTo === user.id : true)
                            .map(task => {
                                const style = getStatusStyle(task.status);
                                return (
                                    <div key={task.id} style={s.row}>
                                        <div style={{flex: 2}}>
                                            <div style={s.taskTitle}>{task.title}</div>
                                            <div style={s.taskDesc}>{task.description}</div>
                                        </div>
                                        <div style={{flex: 1}}>
                                            <span style={{...s.badge, color: style.color, backgroundColor: style.bg}}>
                                                {style.label}
                                            </span>
                                        </div>
                                        <div style={{flex: 1, textAlign: 'right'}}>
                                            {/* MANAGER: ALOCARE */}
                                            {user.role === 'manager' && task.status === 'OPEN' && (
                                                <select 
                                                    style={s.select} 
                                                    onChange={(e) => handleAction(task.id, 'assign', { assignedTo: e.target.value })}
                                                >
                                                    <option value="">Alocă...</option>
                                                    {users.filter(u => u.role === 'executant' && u.managerId === user.id).map(u => (
                                                        <option key={u.id} value={u.id}>{u.firstName}</option>
                                                    ))}
                                                </select>
                                            )}
                                            
                                            {/* EXECUTANT: FINALIZARE */}
                                            {task.status === 'PENDING' && task.assignedTo === user.id && (
                                                <button style={s.btnDone} onClick={() => handleAction(task.id, 'complete')}>
                                                    Realizat
                                                </button>
                                            )}

                                            {/* MANAGER: INCHIDERE */}
                                            {user.role === 'manager' && task.status === 'COMPLETED' && (
                                                <button style={s.btnClose} onClick={() => handleAction(task.id, 'close')}>
                                                    Închide
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- STILURI ---
const s = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' },
    sidebar: { width: '280px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' },
    logoIcon: { backgroundColor: '#3b82f6', color: '#fff', width: '35px', height: '35px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    logoText: { fontSize: '20px', fontWeight: 'bold' },
    nav: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
    navBtn: { padding: '12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#64748b', borderRadius: '10px' },
    navActive: { padding: '12px', border: 'none', backgroundColor: '#eff6ff', color: '#3b82f6', textAlign: 'left', fontWeight: 'bold', borderRadius: '10px' },
    userBox: { marginTop: 'auto', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' },
    avatar: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    uName: { fontSize: '14px', fontWeight: 'bold' },
    uRole: { fontSize: '11px', color: '#94a3b8' },
    logout: { position: 'absolute', right: '10px', border: 'none', background: 'none', cursor: 'pointer', color: '#cbd5e1' },
    main: { flexGrow: 1, marginLeft: '280px', padding: '50px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '26px', fontWeight: '800', marginBottom: '5px' },
    subtitle: { color: '#64748b' },
    statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
    statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #f1f5f9' },
    statLabel: { fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' },
    statValue: { fontSize: '28px', fontWeight: '800' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' },
    row: { display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f8fafc' },
    taskTitle: { fontWeight: 'bold', fontSize: '15px' },
    taskDesc: { fontSize: '13px', color: '#94a3b8' },
    badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    select: { padding: '5px', borderRadius: '5px', border: '1px solid #e2e8f0', fontSize: '12px' },
    btnDone: { padding: '7px 15px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px' },
    btnClose: { padding: '7px 15px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px' }
};

export default Dashboard;