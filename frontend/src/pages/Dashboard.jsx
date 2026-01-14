import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const token = localStorage.getItem('token');
    const API_URL = "https://taskflow-api-qkmb.onrender.com"; 
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Rutele din server.js-ul tău
            const resTasks = await axios.get(`${API_URL}/projects`, { headers });
            const allTasks = resTasks.data.flatMap(p => p.Tasks || []);
            setTasks(allTasks);

            if (user.role !== 'executant') {
                const resUsers = await axios.get(`${API_URL}/users`, { headers });
                setUsers(resUsers.data);
            }
        } catch (err) {
            console.error("Eroare API:", err);
        }
        setLoading(false);
    };

    const handleAction = async (taskId, action, body = {}) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/${action}`, body, { headers });
            fetchData();
        } catch (err) {
            alert("Eroare la procesarea task-ului!");
        }
    };

    // Funcții de ajutor pentru design
    const getStatusInfo = (status) => {
        const map = {
            'OPEN': { color: '#3b82f6', bg: '#eff6ff', label: 'Deschis' },
            'PENDING': { color: '#f59e0b', bg: '#fffbeb', label: 'În Lucru' },
            'COMPLETED': { color: '#10b981', bg: '#ecfdf5', label: 'Finalizat' },
            'CLOSED': { color: '#6b7280', bg: '#f3f4f6', label: 'Închis' }
        };
        return map[status] || map['OPEN'];
    };

    return (
        <div style={styles.appContainer}>
            {/* SIDEBAR PROFESIONAL */}
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <div style={styles.logoIcon}>TF</div>
                    <span style={styles.logoText}>TaskFlow<span style={{color:'#3b82f6'}}>Pro</span></span>
                </div>
                
                <nav style={styles.sideNav}>
                    <button style={activeTab === 'overview' ? styles.navActive : styles.navBtn} onClick={() => setActiveTab('overview')}>
                        📊 Ansamblu
                    </button>
                    <button style={activeTab === 'mytasks' ? styles.navActive : styles.navBtn} onClick={() => setActiveTab('mytasks')}>
                        ✅ Sarcinile Mele
                    </button>
                    {user.role === 'admin' && (
                        <button style={styles.navBtn}>⚙️ Administrare</button>
                    )}
                </nav>

                <div style={styles.userSection}>
                    <div style={styles.userCard}>
                        <div style={styles.userInitials}>{user.name?.charAt(0)}</div>
                        <div style={{overflow:'hidden'}}>
                            <div style={styles.userName}>{user.name}</div>
                            <div style={styles.userRoleText}>{user.role?.toUpperCase()}</div>
                        </div>
                    </div>
                    <button onClick={() => {localStorage.clear(); window.location.href='/login'}} style={styles.logoutBtn}>
                        Deconectare
                    </button>
                </div>
            </aside>

            {/* CONTINUT PRINCIPAL */}
            <main style={styles.mainContent}>
                <header style={styles.topHeader}>
                    <div>
                        <h1 style={styles.welcomeText}>Salutare, {user.name}!</h1>
                        <p style={styles.subtext}>Iată situația proiectelor tale astăzi.</p>
                    </div>
                </header>

                {/* KPI CARDS (Statistici) */}
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <span style={styles.statLabel}>Task-uri Active</span>
                        <div style={styles.statValue}>{tasks.filter(t => t.status !== 'CLOSED').length}</div>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statLabel}>Echipa Ta</span>
                        <div style={styles.statValue}>{users.length}</div>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statLabel}>Rată de succes</span>
                        <div style={styles.statValue}>88%</div>
                    </div>
                </div>

                {/* TASK FEED */}
                <div style={styles.feedSection}>
                    <h3 style={styles.sectionTitle}>Fluxul de Activitate</h3>
                    <div style={styles.taskTable}>
                        {tasks.map(task => {
                            const status = getStatusInfo(task.status);
                            return (
                                <div key={task.id} style={styles.taskRow}>
                                    <div style={{flex: 2}}>
                                        <div style={styles.taskTitleText}>{task.title}</div>
                                        <div style={styles.taskDescriptionText}>{task.description}</div>
                                    </div>
                                    <div style={{flex: 1}}>
                                        <span style={{...styles.statusTag, color: status.color, backgroundColor: status.bg}}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div style={{flex: 1, textAlign: 'right'}}>
                                        {/* BUTOANE CONDIȚIONATE */}
                                        {user.role === 'manager' && task.status === 'OPEN' && (
                                            <select style={styles.actionSelect} onChange={(e) => handleAction(task.id, 'assign', { assignedTo: e.target.value })}>
                                                <option value="">Alocă...</option>
                                                {users.filter(u => u.role === 'executant' && u.managerId === user.id).map(u => (
                                                    <option key={u.id} value={u.id}>{u.firstName}</option>
                                                ))}
                                            </select>
                                        )}
                                        {user.role === 'executant' && task.status === 'PENDING' && (
                                            <button style={styles.primaryAction} onClick={() => handleAction(task.id, 'complete')}>Finalizează</button>
                                        )}
                                        {user.role === 'manager' && task.status === 'COMPLETED' && (
                                            <button style={styles.secondaryAction} onClick={() => handleAction(task.id, 'close')}>Închide</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- DESIGN SISTEM (STILURI) ---
const styles = {
    appContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: "'Inter', sans-serif" },
    sidebar: { width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '32px 24px', display: 'flex', flexDirection: 'column' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
    logoIcon: { backgroundColor: '#3b82f6', color: '#fff', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' },
    logoText: { fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' },
    sideNav: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    navBtn: { padding: '12px 16px', border: 'none', background: 'none', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#64748b', fontWeight: '500', transition: '0.2s' },
    navActive: { padding: '12px 16px', border: 'none', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '12px', textAlign: 'left', fontWeight: '600' },
    userSection: { marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f1f5f9' },
    userCard: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
    userInitials: { width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#3b82f6' },
    userName: { fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
    userRoleText: { fontSize: '11px', color: '#94a3b8', fontWeight: '700' },
    logoutBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2', backgroundColor: '#fff', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
    mainContent: { flexGrow: 1, padding: '48px', overflowY: 'auto' },
    topHeader: { marginBottom: '32px' },
    welcomeText: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
    subtext: { color: '#64748b', fontSize: '16px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' },
    statCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
    statLabel: { fontSize: '14px', fontWeight: '600', color: '#94a3b8' },
    statValue: { fontSize: '32px', fontWeight: '800', color: '#1e293b', marginTop: '4px' },
    feedSection: { backgroundColor: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
    sectionTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '24px' },
    taskTable: { display: 'flex', flexDirection: 'column' },
    taskRow: { display: 'flex', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #f8fafc' },
    taskTitleText: { fontWeight: '600', fontSize: '15px' },
    taskDescriptionText: { fontSize: '13px', color: '#94a3b8', marginTop: '2px' },
    statusTag: { padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '700' },
    actionSelect: { padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' },
    primaryAction: { padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    secondaryAction: { padding: '8px 16px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }
};

export default Dashboard;