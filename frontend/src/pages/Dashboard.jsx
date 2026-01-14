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
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/tasks`, { ...newTask, status: 'OPEN' }, { headers });
            alert("Task creat cu starea OPEN!");
            setShowTaskForm(false);
            setNewTask({ title: '', description: '', projectId: '' });
            fetchData();
        } catch (err) { alert("Eroare la creare task"); }
    };

    const handleAction = async (taskId, action, body = {}) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/${action}`, body, { headers });
            fetchData();
        } catch (err) { alert("Acțiune eșuată!"); }
    };

    const allTasks = projects.flatMap(p => p.Tasks || []);
    const myTasks = allTasks.filter(t => t.assignedTo === user.id);
    const myTeam = user.role === 'manager' ? users.filter(u => u.managerId === user.id) : users.filter(u => u.id === user.managerId);

    const getStatusStyle = (status) => {
        const map = {
            'OPEN': { color: '#6366f1', bg: '#eef2ff', dot: '#6366f1' },
            'PENDING': { color: '#f59e0b', bg: '#fffbeb', dot: '#f59e0b' },
            'COMPLETED': { color: '#10b981', bg: '#f0fdf4', dot: '#10b981' },
            'CLOSED': { color: '#64748b', bg: '#f8fafc', dot: '#64748b' }
        };
        return map[status] || map['OPEN'];
    };

    return (
        <div style={s.app}>
            {/* SIDEBAR */}
            <aside style={s.sidebar}>
                <div style={s.brand}><div style={s.logoSquare}>TF</div><span style={s.brandName}>TaskFlow</span></div>
                <nav style={s.sideNav}>
                    <button style={activeTab === 'overview' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('overview')}>Overview</button>
                    <button style={activeTab === 'mytasks' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('mytasks')}>Sarcini</button>
                    <button style={activeTab === 'team' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('team')}>Echipa</button>
                    {user.role === 'admin' && <button style={s.navBtn} onClick={() => navigate('/admin')}>Admin Panel</button>}
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
                    <h2 style={s.pageTitle}>{activeTab.toUpperCase()}</h2>
                    {user.role === 'manager' && (
                        <button onClick={() => setShowTaskForm(!showTaskForm)} style={s.actionBtn}>
                            {showTaskForm ? 'Închide' : '+ Nou Task'}
                        </button>
                    )}
                </header>

                {/* FORMULAR CREARE TASK (DOAR PENTRU MANAGER) */}
                {showTaskForm && (
                    <div style={s.premiumForm}>
                        <form onSubmit={handleCreateTask} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                            <h4 style={{margin:0}}>Creare Sarcina Noua (OPEN)</h4>
                            <input type="text" placeholder="Titlu Sarcina" style={s.pInput} value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                            <textarea placeholder="Descriere suficientă pentru a fi realizată..." style={s.pTextarea} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required />
                            <select style={s.pInput} value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} required>
                                <option value="">Alege Proiectul...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button type="submit" style={s.btnSubmit}>Lansează Task</button>
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
                                <tr><th style={s.th}>SARCINĂ</th><th style={s.th}>STATUS</th><th style={s.th}>EXECUTANT</th><th style={s.th}>ACȚIUNI</th></tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'mytasks' ? myTasks : allTasks).map(task => {
                                    const st = getStatusStyle(task.status);
                                    return (
                                        <tr key={task.id} style={s.tr}>
                                            <td style={s.td}><div style={s.taskName}>{task.title}</div></td>
                                            <td style={s.td}><span style={{...s.statusBadge, color: st.color, backgroundColor: st.bg}}>{task.status}</span></td>
                                            <td style={s.td}>{task.executor?.firstName || 'Nealocat'}</td>
                                            <td style={s.td}>
                                                {user.role === 'manager' && task.status === 'OPEN' && (
                                                    <select style={s.actionSelect} onChange={(e) => handleAction(task.id, 'assign', { assignedTo: e.target.value })}>
                                                        <option value="">Alocă...</option>
                                                        {users.filter(u => u.role === 'executant' && u.managerId === user.id).map(u => (
                                                            <option key={u.id} value={u.id}>{u.firstName}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                {task.status === 'PENDING' && task.assignedTo === user.id && <button style={s.actionBtnSmall} onClick={() => handleAction(task.id, 'complete')}>Finalizează</button>}
                                                {user.role === 'manager' && task.status === 'COMPLETED' && <button style={{...s.actionBtnSmall, backgroundColor:'#1e293b'}} onClick={() => handleAction(task.id, 'close')}>Închide</button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

const s = {
    app: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' },
    brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' },
    logoSquare: { backgroundColor: '#4318FF', color: '#fff', padding: '8px', borderRadius: '8px', fontWeight: 'bold' },
    brandName: { fontSize: '20px', fontWeight: 'bold' },
    sideNav: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
    navBtn: { border: 'none', background: 'none', padding: '12px', textAlign: 'left', cursor: 'pointer', color: '#a3aed0', fontWeight: '600' },
    navBtnActive: { border: 'none', background: '#f4f7fe', padding: '12px', textAlign: 'left', cursor: 'pointer', color: '#4318FF', fontWeight: 'bold', borderRadius: '10px' },
    userCard: { marginTop: 'auto', padding: '15px', backgroundColor: '#f4f7fe', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' },
    userAvatar: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#4318FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    userName: { fontSize: '13px', fontWeight: 'bold' },
    userRole: { fontSize: '10px', color: '#a3aed0' },
    logoutBtn: { border: 'none', background: 'none', cursor: 'pointer' },
    main: { flexGrow: 1, marginLeft: '260px', padding: '40px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    pageTitle: { margin: 0, fontWeight: '800' },
    actionBtn: { padding: '10px 20px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    premiumForm: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
    pInput: { padding: '10px', borderRadius: '8px', border: '1px solid #e0e5f2' },
    pTextarea: { padding: '10px', borderRadius: '8px', border: '1px solid #e0e5f2', minHeight: '60px' },
    btnSubmit: { padding: '10px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    contentWrapper: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', color: '#a3aed0', fontSize: '11px', paddingBottom: '15px' },
    tr: { borderBottom: '1px solid #f4f7fe' },
    td: { padding: '15px 0', fontSize: '14px' },
    taskName: { fontWeight: 'bold' },
    statusBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
    actionBtnSmall: { padding: '5px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
    actionSelect: { padding: '5px', borderRadius: '5px', border: '1px solid #f4f7fe' },
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    memberCard: { padding: '20px', backgroundColor: '#f4f7fe', borderRadius: '15px', textAlign: 'center' },
    memberImg: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontWeight: 'bold', color: '#4318FF' },
    memberName: { fontWeight: 'bold', fontSize: '14px' },
    memberRole: { fontSize: '11px', color: '#a3aed0' }
};

export default Dashboard;