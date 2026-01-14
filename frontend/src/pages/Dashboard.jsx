import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); 
    const [loading, setLoading] = useState(true);
    
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

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/projects`, newProject, { headers });
            setShowProjectForm(false);
            setNewProject({ name: '', description: '' });
            fetchData();
        } catch (err) { alert("Eroare la creare proiect"); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/tasks`, { ...newTask, status: 'OPEN' }, { headers });
            setShowTaskForm(false);
            setNewTask({ title: '', description: '', projectId: '' });
            fetchData();
        } catch (err) { alert("Eroare la creare sarcină"); }
    };

    const handleUpdateTask = async (taskId, action, body = {}) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/${action}`, body, { headers });
            fetchData();
        } catch (err) { alert("Acțiune eșuată!"); }
    };

    // FUNCTIE NOUA: STERGERE TASK
    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Ești sigur că vrei să ștergi această sarcină?")) {
            try {
                // Notă: Asigură-te că ai ruta DELETE /api/tasks/:id în server.js
                await axios.delete(`${API_URL}/tasks/${taskId}`, { headers });
                fetchData();
            } catch (err) { alert("Eroare la ștergere!"); }
        }
    };

    const allTasks = projects.flatMap(p => p.Tasks || []);
    const historyTasks = allTasks.filter(t => t.status === 'CLOSED');
    const activeTasks = allTasks.filter(t => t.status !== 'CLOSED');

    return (
        <div style={s.app}>
            {/* SIDEBAR MODERN */}
            <aside style={s.sidebar}>
                <div style={s.brand}><div style={s.logoSquare}>TF</div><span style={s.brandName}>TaskFlow</span></div>
                <nav style={s.sideNav}>
                    <button style={activeTab === 'overview' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    {/* TEXT CORECTAT: MY TASKS */}
                    <button style={activeTab === 'mytasks' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('mytasks')}>✅ My Tasks</button>
                    <button style={activeTab === 'history' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('history')}>📜 History</button>
                    {user.role === 'admin' && <button style={s.navBtn} onClick={() => navigate('/admin')}>⚙️ Admin Panel</button>}
                </nav>
                <div style={s.userCard}>
                    <div style={s.userAvatar}>{displayName.charAt(0)}</div>
                    <div><div style={s.userName}>{displayName} {user.lastName}</div><div style={s.userRole}>{user.role?.toUpperCase()}</div></div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main style={s.main}>
                <header style={s.topBar}>
                    <div>
                        <h2 style={s.pageTitle}>{activeTab === 'mytasks' ? 'My Tasks' : activeTab.toUpperCase()}</h2>
                        <p style={s.breadcrumb}>Project Management / {activeTab}</p>
                    </div>
                    {user.role === 'manager' && (
                        <div style={{display:'flex', gap:'12px'}}>
                            <button onClick={() => {setShowProjectForm(!showProjectForm); setShowTaskForm(false)}} style={s.secBtn}>+ New Project</button>
                            <button onClick={() => {setShowTaskForm(!showTaskForm); setShowProjectForm(false)}} style={s.actionBtn}>+ New Task</button>
                        </div>
                    )}
                </header>

                {/* FORMULARELE RAMAN IN STIL GLASSMORPHISM */}
                {(showProjectForm || showTaskForm) && (
                    <div style={s.premiumForm}>
                        {showProjectForm ? (
                             <form onSubmit={handleCreateProject} style={s.flexCol}>
                                <h4 style={s.formHeader}>Definire Proiect Nou</h4>
                                <input type="text" placeholder="Nume Proiect" style={s.pInput} value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
                                <textarea placeholder="Obiective..." style={s.pTextarea} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} required />
                                <button type="submit" style={s.btnSubmit}>Creează Proiect</button>
                             </form>
                        ) : (
                            <form onSubmit={handleCreateTask} style={s.flexCol}>
                                <h4 style={s.formHeader}>Lansare Sarcină Nouă</h4>
                                <select style={s.pInput} value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} required>
                                    <option value="">Alege Proiectul...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="text" placeholder="Titlu Sarcina" style={s.pInput} value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                                <textarea placeholder="Descriere..." style={s.pTextarea} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required />
                                <button type="submit" style={s.btnSubmit}>Lansează Task</button>
                            </form>
                        )}
                    </div>
                )}

                <div style={s.tableContainer}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Task Details</th>
                                <th style={s.th}>Project</th>
                                <th style={s.th}>Status</th>
                                <th style={s.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'history' ? historyTasks : activeTasks).map(task => (
                                <tr key={task.id} style={s.tr}>
                                    <td style={s.td}>
                                        <div style={s.taskTitle}>{task.title}</div>
                                        <div style={s.taskDesc}>{task.description}</div>
                                    </td>
                                    <td style={s.td}><span style={s.projBadge}>{projects.find(p => p.id === task.projectId)?.name}</span></td>
                                    <td style={s.td}>
                                        <span style={{...s.statusBadge, ...getStatusStyle(task.status)}}>{task.status}</span>
                                    </td>
                                    <td style={s.td}>
                                        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                            {user.role === 'manager' && task.status === 'OPEN' && (
                                                <select style={s.actionSelect} onChange={(e) => handleUpdateTask(task.id, 'assign', { assignedTo: e.target.value })}>
                                                    <option value="">Assign to...</option>
                                                    {users.filter(u => u.role === 'executant' && u.managerId === user.id).map(u => (
                                                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                                    ))}
                                                </select>
                                            )}
                                            {task.status === 'PENDING' && task.assignedTo === user.id && (
                                                <button style={s.btnDone} onClick={() => handleUpdateTask(task.id, 'complete')}>Mark Done</button>
                                            )}
                                            {user.role === 'manager' && task.status === 'COMPLETED' && (
                                                <button style={s.btnClose} onClick={() => handleUpdateTask(task.id, 'close')}>Archive</button>
                                            )}
                                            {/* BUTON STERGERE (Manager Only) */}
                                            {user.role === 'manager' && (
                                                <button style={s.btnDelete} onClick={() => handleDeleteTask(task.id)} title="Delete Task">🗑️</button>
                                            )}
                                        </div>
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

// Helper pentru culori status
const getStatusStyle = (status) => {
    switch(status) {
        case 'OPEN': return { backgroundColor: '#E0E7FF', color: '#4318FF' };
        case 'PENDING': return { backgroundColor: '#FFF7ED', color: '#C2410C' };
        case 'COMPLETED': return { backgroundColor: '#DCFCE7', color: '#15803D' };
        case 'CLOSED': return { backgroundColor: '#F1F5F9', color: '#64748B' };
        default: return {};
    }
};

const s = {
    app: { display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
    sidebar: { width: '280px', backgroundColor: '#FFF', padding: '40px 24px', position: 'fixed', height: '100vh', borderRight: '1px solid #E2E8F0', zIndex: 10 },
    brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', paddingLeft: '12px' },
    logoSquare: { backgroundColor: '#4318FF', color: '#FFF', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' },
    brandName: { fontSize: '22px', fontWeight: '800', color: '#1B2559', letterSpacing: '-0.5px' },
    sideNav: { display: 'flex', flexDirection: 'column', gap: '8px' },
    navBtn: { border: 'none', background: 'none', padding: '12px 16px', textAlign: 'left', cursor: 'pointer', color: '#A3AED0', fontWeight: '600', borderRadius: '12px', transition: '0.2s' },
    navBtnActive: { border: 'none', background: '#F4F7FE', padding: '12px 16px', textAlign: 'left', cursor: 'pointer', color: '#4318FF', fontWeight: '700', borderRadius: '12px' },
    userCard: { position: 'absolute', bottom: '40px', left: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#F4F7FE', borderRadius: '16px' },
    userAvatar: { width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#4318FF', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    userName: { fontSize: '14px', fontWeight: '700', color: '#1B2559' },
    userRole: { fontSize: '11px', color: '#A3AED0', fontWeight: '600' },
    main: { flexGrow: 1, marginLeft: '280px', padding: '40px 60px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' },
    pageTitle: { margin: 0, color: '#1B2559', fontSize: '34px', fontWeight: '800', letterSpacing: '-1px' },
    breadcrumb: { margin: '4px 0 0 0', color: '#A3AED0', fontSize: '14px', fontWeight: '500' },
    actionBtn: { padding: '12px 24px', backgroundColor: '#4318FF', color: '#FFF', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', boxShadow: '0px 10px 20px rgba(67, 24, 255, 0.2)' },
    secBtn: { padding: '12px 24px', backgroundColor: '#FFF', color: '#1B2559', border: '1px solid #E2E8F0', borderRadius: '14px', cursor: 'pointer', fontWeight: '700' },
    premiumForm: { backgroundColor: '#FFF', padding: '32px', borderRadius: '24px', marginBottom: '32px', border: '1px solid #E2E8F0', boxShadow: '0px 20px 40px rgba(0,0,0,0.02)' },
    formHeader: { margin: '0 0 20px 0', fontSize: '18px', color: '#1B2559', fontWeight: '700' },
    flexCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
    pInput: { padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', outline: 'none', fontSize: '14px' },
    pTextarea: { padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', minHeight: '100px', outline: 'none', fontSize: '14px' },
    btnSubmit: { padding: '14px', backgroundColor: '#4318FF', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
    tableContainer: { backgroundColor: '#FFF', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', color: '#A3AED0', fontSize: '12px', fontWeight: '700', padding: '0 0 20px 16px', textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { borderBottom: '1px solid #F1F5F9' },
    td: { padding: '24px 16px' },
    taskTitle: { fontSize: '16px', fontWeight: '700', color: '#1B2559', marginBottom: '4px' },
    taskDesc: { fontSize: '14px', color: '#A3AED0', lineHeight: '1.5' },
    projBadge: { padding: '6px 12px', backgroundColor: '#F4F7FE', color: '#1B2559', borderRadius: '10px', fontSize: '12px', fontWeight: '700' },
    statusBadge: { padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' },
    actionSelect: { padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: '600', color: '#1B2559' },
    btnDone: { padding: '8px 16px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
    btnClose: { padding: '8px 16px', backgroundColor: '#1B2559', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
    btnDelete: { background: '#FFF1F2', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s', filter: 'grayscale(1)' }
};

export default Dashboard;