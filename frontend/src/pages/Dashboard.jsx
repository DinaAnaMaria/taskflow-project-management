import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); 
    const [loading, setLoading] = useState(true);
    
    // State-uri pentru formulare
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '' });

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const token = localStorage.getItem('token');
    const API_URL = "https://taskflow-api-qkmb.onrender.com/api"; 
    const headers = { Authorization: `Bearer ${token}` };
    const displayName = user.firstName || "Utilizator";

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

    // FUNCTIE CREARE PROIECT
    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/projects`, newProject, { headers });
            alert("Proiect creat! Acum poți adăuga sarcini în el.");
            setShowProjectForm(false);
            setNewProject({ name: '', description: '' });
            fetchData();
        } catch (err) { alert("Eroare la creare proiect"); }
    };

    // FUNCTIE CREARE TASK
    const handleCreateTask = async (e) => {
    e.preventDefault();
    console.log("Date trimise la server:", newTask); // VEZI ASTA ÎN CONSOLĂ (F12)
    
    if (!newTask.projectId) {
        alert("Te rugăm să selectezi un proiect din listă!");
        return;
    }

    try {
        await axios.post(`${API_URL}/tasks`, { ...newTask, status: 'OPEN' }, { headers });
        alert("Sarcina a fost lansată!");
        // ... restul codului
    } catch (err) {
        console.error("Eroare detaliată:", err.response?.data);
        alert("Eroare: " + (err.response?.data?.error || "Verifică consola"));
    }
};

    const handleUpdateTask = async (taskId, action, body = {}) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/${action}`, body, { headers });
            fetchData();
        } catch (err) { alert("Acțiune eșuată!"); }
    };

    const allTasks = projects.flatMap(p => p.Tasks || []);
    const historyTasks = allTasks.filter(t => t.status === 'CLOSED');
    const activeTasks = allTasks.filter(t => t.status !== 'CLOSED');

    return (
        <div style={s.app}>
            {/* SIDEBAR */}
            <aside style={s.sidebar}>
                <div style={s.brand}><div style={s.logoSquare}>TF</div><span style={s.brandName}>TaskFlow</span></div>
                <nav style={s.sideNav}>
                    <button style={activeTab === 'overview' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    <button style={activeTab === 'mytasks' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('mytasks')}>✅ Sarcini Active</button>
                    <button style={activeTab === 'history' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('history')}>📜 Istoric</button>
                    {user.role === 'admin' && <button style={s.navBtn} onClick={() => navigate('/admin')}>⚙️ Admin Panel</button>}
                </nav>
                <div style={s.userCard}>
                    <div style={s.userAvatar}>{displayName.charAt(0)}</div>
                    <div><div style={s.userName}>{displayName}</div><div style={s.userRole}>{user.role?.toUpperCase()}</div></div>
                </div>
            </aside>

            {/* MAIN */}
            <main style={s.main}>
                <header style={s.topBar}>
                    <h2 style={s.pageTitle}>{activeTab.toUpperCase()}</h2>
                    {user.role === 'manager' && (
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={() => {setShowProjectForm(!showProjectForm); setShowTaskForm(false)}} style={s.secBtn}>+ Proiect Nou</button>
                            <button onClick={() => {setShowTaskForm(!showTaskForm); setShowProjectForm(false)}} style={s.actionBtn}>+ Sarcină Nouă</button>
                        </div>
                    )}
                </header>

                {/* FORMULAR PROIECT */}
                {showProjectForm && (
                    <div style={s.premiumForm}>
                        <form onSubmit={handleCreateProject} style={s.flexCol}>
                            <h4 style={{margin:0}}>Definire Proiect Nou</h4>
                            <input type="text" placeholder="Nume Proiect (ex: Implementare TaskFlow v1.0)" style={s.pInput} value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
                            <textarea placeholder="Obiectivele proiectului..." style={s.pTextarea} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} required />
                            <button type="submit" style={s.btnSubmit}>Salvează Proiectul</button>
                        </form>
                    </div>
                )}

                {/* FORMULAR TASK */}
                {showTaskForm && (
                    <div style={s.premiumForm}>
                        <form onSubmit={handleCreateTask} style={s.flexCol}>
                            <h4 style={{margin:0}}>Lansare Sarcină Nouă</h4>
                            <select style={s.pInput} value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} required>
                                <option value="">Alege Proiectul Destinație...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="text" placeholder="Titlu Sarcina" style={s.pInput} value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                            <textarea placeholder="Instrucțiuni pentru executant..." style={s.pTextarea} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required />
                            <button type="submit" style={s.btnSubmit}>Creează Sarcină (OPEN)</button>
                        </form>
                    </div>
                )}

                <div style={s.contentWrapper}>
                    <table style={s.table}>
                        <thead>
                            <tr><th style={s.th}>SARCINĂ</th><th style={s.th}>PROIECT</th><th style={s.th}>STATUS</th><th style={s.th}>ACȚIUNI</th></tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'history' ? historyTasks : activeTasks).map(task => (
                                <tr key={task.id} style={s.tr}>
                                    <td style={s.td}><strong>{task.title}</strong><br/><small>{task.description}</small></td>
                                    <td style={s.td}>{projects.find(p => p.id === task.projectId)?.name}</td>
                                    <td style={s.td}><span style={s.badge}>{task.status}</span></td>
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
                                            <button style={s.btnClose} onClick={() => handleUpdateTask(task.id, 'close')}>Închide (Archive)</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

const s = {
    app: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#fff', padding: '30px', position: 'fixed', height: '100vh', borderRight: '1px solid #e0e5f2' },
    brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' },
    logoSquare: { backgroundColor: '#4318FF', color: '#fff', padding: '8px', borderRadius: '8px', fontWeight: 'bold' },
    brandName: { fontSize: '20px', fontWeight: 'bold', color: '#1b2559' },
    sideNav: { display: 'flex', flexDirection: 'column', gap: '10px' },
    navBtn: { border: 'none', background: 'none', padding: '12px', textAlign: 'left', cursor: 'pointer', color: '#a3aed0', fontWeight: '600' },
    navBtnActive: { border: 'none', background: '#f4f7fe', padding: '12px', textAlign: 'left', cursor: 'pointer', color: '#4318FF', fontWeight: 'bold', borderRadius: '10px' },
    userCard: { position: 'absolute', bottom: '30px', left: '30px', right: '30px', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#f4f7fe', borderRadius: '15px' },
    userAvatar: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#4318FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    userName: { fontSize: '13px', fontWeight: 'bold' },
    userRole: { fontSize: '10px', color: '#a3aed0' },
    main: { flexGrow: 1, marginLeft: '260px', padding: '50px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    pageTitle: { margin: 0, color: '#1b2559', fontWeight: '800' },
    actionBtn: { padding: '12px 20px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    secBtn: { padding: '12px 20px', backgroundColor: '#fff', color: '#4318FF', border: '1px solid #4318FF', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
    premiumForm: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
    flexCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
    pInput: { padding: '12px', borderRadius: '10px', border: '1px solid #e0e5f2' },
    pTextarea: { padding: '12px', borderRadius: '10px', border: '1px solid #e0e5f2', minHeight: '80px' },
    btnSubmit: { padding: '12px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    contentWrapper: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', color: '#a3aed0', fontSize: '11px', paddingBottom: '15px', textTransform: 'uppercase' },
    tr: { borderBottom: '1px solid #f4f7fe' },
    td: { padding: '15px 0', fontSize: '14px' },
    badge: { padding: '4px 10px', backgroundColor: '#eef2ff', color: '#4318FF', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
    actionSelect: { padding: '6px', borderRadius: '8px', border: '1px solid #e0e5f2', fontSize: '12px' },
    btnDone: { padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    btnClose: { padding: '6px 12px', backgroundColor: '#1b2559', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default Dashboard;