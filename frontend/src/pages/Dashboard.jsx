import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); 
    const [loading, setLoading] = useState(true);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '' });

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const token = localStorage.getItem('token');
    const API_URL = "https://taskflow-api-qkmb.onrender.com/api"; 
    const headers = { Authorization: `Bearer ${token}` };
    const displayName = user.firstName || user.name || "Utilizator";

    useEffect(() => {
        if (!token) navigate('/login');
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resProj = await axios.get(`${API_URL}/projects`, { headers });
            setProjects(resProj.data);
            const resUsers = await axios.get(`${API_URL}/users`, { headers });
            setUsers(resUsers.data);
        } catch (err) { console.error("Eroare API:", err); }
        setLoading(false);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/tasks`, { ...newTask, status: 'OPEN' }, { headers });
            alert("Task creat cu succes!");
            setShowTaskForm(false);
            setNewTask({ title: '', description: '', projectId: '' });
            fetchData();
        } catch (err) { alert("Eroare la creare task"); }
    };

    const handleUpdateTask = async (taskId, action, body = {}) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/${action}`, body, { headers });
            fetchData();
        } catch (err) { alert("Acțiune eșuată!"); }
    };

    const allTasks = projects.flatMap(p => p.Tasks || []);
    
    // FILTRARE ISTORIC
    const historyTasks = user.role === 'manager' 
        ? allTasks.filter(t => t.status === 'CLOSED' && users.find(u => u.id === t.assignedTo && u.managerId === user.id))
        : allTasks.filter(t => t.status === 'CLOSED' && t.assignedTo === user.id);

    const myTasks = allTasks.filter(t => t.assignedTo === user.id && t.status !== 'CLOSED');
    const myTeam = user.role === 'manager' ? users.filter(u => u.managerId === user.id) : users.filter(u => u.id === user.managerId);

    const getStatusStyle = (status) => {
        const map = {
            'OPEN': { color: '#6366f1', bg: '#eef2ff' },
            'PENDING': { color: '#f59e0b', bg: '#fffbeb' },
            'COMPLETED': { color: '#10b981', bg: '#f0fdf4' },
            'CLOSED': { color: '#64748b', bg: '#f1f5f9' }
        };
        return map[status] || map['OPEN'];
    };

    return (
        <div style={s.app}>
            {/* SIDEBAR */}
            <aside style={s.sidebar}>
                <div style={s.brand}><div style={s.logoSquare}>TF</div><span style={s.brandName}>TaskFlow</span></div>
                <nav style={s.sideNav}>
                    <p style={s.navLabel}>MENU</p>
                    <button style={activeTab === 'overview' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    <button style={activeTab === 'mytasks' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('mytasks')}>✅ Sarcini Active</button>
                    <button style={activeTab === 'history' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('history')}>📜 Istoric</button>
                    <button style={activeTab === 'team' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('team')}>👥 Echipa</button>
                    {user.role === 'admin' && <button style={s.navBtn} onClick={() => navigate('/admin')}>⚙️ Admin Panel</button>}
                </nav>
                <div style={s.userCard}>
                    <div style={s.userAvatar}>{displayName.charAt(0)}</div>
                    <div style={{flexGrow: 1}}><div style={s.userName}>{displayName}</div><div style={s.userRole}>{user.role?.toUpperCase()}</div></div>
                    <button onClick={() => {localStorage.clear(); navigate('/login')}} style={s.logoutBtn}>✕</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={s.main}>
                <header style={s.topBar}>
                    <div>
                        <h2 style={s.pageTitle}>{activeTab === 'history' ? 'Arhivă Task-uri' : activeTab.toUpperCase()}</h2>
                        <span style={s.breadcrumb}>Platformă / {activeTab}</span>
                    </div>
                    {user.role === 'manager' && (
                        <button onClick={() => setShowTaskForm(!showTaskForm)} style={s.actionBtn}>
                            {showTaskForm ? 'Închide' : '+ Creează Sarcina'}
                        </button>
                    )}
                </header>

                {/* FORM CREARE TASK */}
                {showTaskForm && (
                    <div style={s.premiumForm}>
                        <form onSubmit={handleCreateTask} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                            <input type="text" placeholder="Titlu Sarcina" style={s.pInput} value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                            <textarea placeholder="Descriere detaliată..." style={s.pTextarea} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required />
                            <select style={s.pInput} value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} required>
                                <option value="">Alege Proiectul...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button type="submit" style={s.btnSubmit}>Lansează în sistem (OPEN)</button>
                        </form>
                    </div>
                )}

                <div style={s.contentWrapper}>
                    {activeTab === 'team' ? (
                        <div style={s.teamGrid}>
                            {myTeam.map(m => (
                                <div key={m.id} style={s.memberCard}>
                                    <div style={s.memberImg}>{m.firstName.charAt(0)}</div>
                                    <div style={s.memberName}>{m.firstName} {m.lastName}</div>
                                    <div style={s.memberRole}>{m.role.toUpperCase()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>DETALII SARCINĂ</th>
                                    <th style={s.th}>STATUS</th>
                                    <th style={s.th}>MEMBRU ALOCAT</th>
                                    {activeTab !== 'history' && <th style={s.th}>ACȚIUNI</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'history' ? historyTasks : (activeTab === 'mytasks' ? myTasks : allTasks.filter(t => t.status !== 'CLOSED'))).map(task => {
                                    const st = getStatusStyle(task.status);
                                    return (
                                        <tr key={task.id} style={s.tr}>
                                            <td style={s.td}>
                                                <div style={s.taskName}>{task.title}</div>
                                                <div style={s.taskSub}>{task.description}</div>
                                            </td>
                                            <td style={s.td}>
                                                <span style={{...s.statusBadge, color: st.color, backgroundColor: st.bg}}>
                                                    ● {task.status}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                <div style={{fontSize:'13px', fontWeight:'600'}}>
                                                    {task.executor ? `${task.executor.firstName} ${task.executor.lastName}` : '---'}
                                                </div>
                                            </td>
                                            {activeTab !== 'history' && (
                                                <td style={s.td}>
                                                    {user.role === 'manager' && task.status === 'OPEN' && (
                                                        <select style={s.actionSelect} onChange={(e) => handleUpdateTask(task.id, 'assign', { assignedTo: e.target.value })}>
                                                            <option value="">Alocă...</option>
                                                            {users.filter(u => u.role === 'executant' && u.managerId === user.id).map(u => (
                                                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    {task.status === 'PENDING' && task.assignedTo === user.id && (
                                                        <button style={s.btnDone} onClick={() => handleUpdateTask(task.id, 'complete')}>Finalizează</button>
                                                    )}
                                                    {user.role === 'manager' && task.status === 'COMPLETED' && (
                                                        <button style={s.btnClose} onClick={() => handleUpdateTask(task.id, 'close')}>Arhivează (Close)</button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {(activeTab === 'history' && historyTasks.length === 0) && (
                        <div style={{textAlign:'center', padding:'40px', color:'#a3aed0'}}>Niciun task în istoric momentan.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

const s = {
    app: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    sidebar: { width: '280px', backgroundColor: '#fff', padding: '40px 30px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', boxShadow: '10px 0 30px rgba(0,0,0,0.02)' },
    brand: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' },
    logoSquare: { backgroundColor: '#4318FF', color: '#fff', padding: '10px', borderRadius: '12px', fontWeight: '800' },
    brandName: { fontSize: '22px', fontWeight: '800', color: '#1b2559', letterSpacing: '-1px' },
    sideNav: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    navLabel: { fontSize: '10px', fontWeight: '800', color: '#a3aed0', margin: '10px 0 10px 10px' },
    navBtn: { border: 'none', background: 'none', padding: '14px', textAlign: 'left', cursor: 'pointer', color: '#a3aed0', fontWeight: '600', borderRadius: '15px', transition: '0.2s' },
    navBtnActive: { border: 'none', background: '#f4f7fe', padding: '14px', textAlign: 'left', cursor: 'pointer', color: '#4318FF', fontWeight: 'bold', borderRadius: '15px' },
    userCard: { marginTop: 'auto', padding: '15px', backgroundColor: '#f4f7fe', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' },
    userAvatar: { width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#4318FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    userName: { fontSize: '14px', fontWeight: 'bold', color: '#1b2559' },
    userRole: { fontSize: '10px', color: '#a3aed0', fontWeight: '700' },
    logoutBtn: { border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' },
    main: { flexGrow: 1, marginLeft: '280px', padding: '50px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    pageTitle: { fontSize: '26px', fontWeight: '800', color: '#1b2559', margin: 0 },
    breadcrumb: { fontSize: '12px', color: '#a3aed0' },
    actionBtn: { padding: '12px 24px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(67, 24, 255, 0.15)' },
    premiumForm: { backgroundColor: '#fff', padding: '25px', borderRadius: '25px', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' },
    pInput: { padding: '12px', borderRadius: '12px', border: '1px solid #e0e5f2', outline: 'none' },
    pTextarea: { padding: '12px', borderRadius: '12px', border: '1px solid #e0e5f2', minHeight: '80px', outline: 'none' },
    btnSubmit: { padding: '12px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    contentWrapper: { backgroundColor: '#fff', padding: '35px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', color: '#a3aed0', fontSize: '11px', fontWeight: '700', paddingBottom: '20px' },
    tr: { borderBottom: '1px solid #f4f7fe' },
    td: { padding: '20px 0', fontSize: '14px' },
    taskName: { fontWeight: 'bold', color: '#1b2559' },
    taskSub: { fontSize: '12px', color: '#a3aed0', marginTop: '4px' },
    statusBadge: { padding: '6px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' },
    btnDone: { padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    btnClose: { padding: '8px 16px', backgroundColor: '#1b2559', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    actionSelect: { padding: '8px', borderRadius: '10px', border: '1px solid #f4f7fe', outline: 'none', fontWeight: '600', color: '#4318FF' },
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    memberCard: { padding: '25px', backgroundColor: '#f4f7fe', borderRadius: '25px', textAlign: 'center' },
    memberImg: { width: '55px', height: '55px', borderRadius: '18px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: '800', color: '#4318FF', fontSize: '20px' },
    memberName: { fontWeight: 'bold', fontSize: '15px', color: '#1b2559' },
    memberRole: { fontSize: '10px', color: '#a3aed0', fontWeight: '700', marginTop: '4px' }
};

export default Dashboard;