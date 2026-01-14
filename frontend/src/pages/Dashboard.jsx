import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); 
    const [loading, setLoading] = useState(true);

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
        } catch (err) { console.error("API Error:", err); }
        setLoading(false);
    };

    const handleAction = async (taskId, action, body = {}) => {
        try {
            await axios.put(`${API_URL}/tasks/${taskId}/${action}`, body, { headers });
            fetchData();
        } catch (err) { alert(err.response?.data?.error || "Acțiune eșuată"); }
    };

    const allTasks = projects.flatMap(p => p.Tasks || []);
    const myTasks = allTasks.filter(t => t.assignedTo === user.id);
    const myTeam = user.role === 'manager' 
        ? users.filter(u => u.managerId === user.id) 
        : users.filter(u => u.id === user.managerId);

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
            {/* --- SIDEBAR PREMIUM --- */}
            <aside style={s.sidebar}>
                <div style={s.brand}>
                    <div style={s.logoSquare}><i className="bi bi-layers-half"></i></div>
                    <span style={s.brandName}>TaskFlow<span style={{fontWeight:'300'}}>AI</span></span>
                </div>

                <nav style={s.sideNav}>
                    <p style={s.navLabel}>MENIU PRINCIPAL</p>
                    <button style={activeTab === 'overview' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('overview')}>
                        <i className="bi bi-grid-1x2-fill"></i> Overview
                    </button>
                    <button style={activeTab === 'mytasks' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('mytasks')}>
                        <i className="bi bi-check-circle-fill"></i> Sarcini
                    </button>
                    <button style={activeTab === 'team' ? s.navBtnActive : s.navBtn} onClick={() => setActiveTab('team')}>
                        <i className="bi bi-people-fill"></i> Echipa
                    </button>
                    
                    {user.role === 'admin' && (
                        <button style={s.navBtn} onClick={() => navigate('/admin')}>
                            <i className="bi bi-shield-lock-fill"></i> Admin Panel
                        </button>
                    )}
                </nav>

                <div style={s.userCard}>
                    <div style={s.userAvatar}>{displayName.charAt(0)}</div>
                    <div style={{flexGrow: 1}}>
                        <div style={s.userName}>{displayName}</div>
                        <div style={s.userRole}>{user.role?.toUpperCase()}</div>
                    </div>
                    <button onClick={() => {localStorage.clear(); navigate('/login')}} style={s.logoutBtn}>
                        <i className="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </aside>

            {/* --- CONTENT AREA --- */}
            <main style={s.main}>
                <header style={s.topBar}>
                    <div style={s.pageInfo}>
                        <h2 style={s.pageTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                        <span style={s.breadcrumb}>Pagini / {activeTab}</span>
                    </div>
                    <div style={s.searchBar}>
                        <i className="bi bi-search"></i>
                        <input type="text" placeholder="Caută sarcini..." style={s.searchInput} />
                    </div>
                </header>

                {/* --- STATS ROW --- */}
                <section style={s.statsGrid}>
                    <div style={s.kpiCard}>
                        <div style={s.kpiIcon}><i className="bi bi-briefcase"></i></div>
                        <div>
                            <div style={s.kpiValue}>{allTasks.length}</div>
                            <div style={s.kpiLabel}>Total Sarcini</div>
                        </div>
                    </div>
                    <div style={s.kpiCard}>
                        <div style={{...s.kpiIcon, color: '#10b981'}}><i className="bi bi-check2-all"></i></div>
                        <div>
                            <div style={s.kpiValue}>{allTasks.filter(t => t.status === 'COMPLETED').length}</div>
                            <div style={s.kpiLabel}>Finalizate</div>
                        </div>
                    </div>
                    <div style={s.kpiCard}>
                        <div style={{...s.kpiIcon, color: '#f59e0b'}}><i className="bi bi-clock-history"></i></div>
                        <div>
                            <div style={s.kpiValue}>{allTasks.filter(t => t.status === 'PENDING').length}</div>
                            <div style={s.kpiLabel}>În Lucru</div>
                        </div>
                    </div>
                </section>

                {/* --- DINAMIC TAB CONTENT --- */}
                <div style={s.contentWrapper}>
                    {activeTab === 'team' ? (
                        <div style={s.teamContainer}>
                            {myTeam.map(m => (
                                <div key={m.id} style={s.memberCard}>
                                    <div style={s.memberImg}>{m.firstName.charAt(0)}</div>
                                    <div style={s.memberInfo}>
                                        <div style={s.memberName}>{m.firstName} {m.lastName}</div>
                                        <div style={s.memberRole}>{m.role.toUpperCase()}</div>
                                    </div>
                                    <div style={s.memberStatus}><div style={s.statusPulse}></div> Online</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr style={s.tableHeader}>
                                    <th style={s.th}>SARCINĂ</th>
                                    <th style={s.th}>STATUS</th>
                                    <th style={s.th}>EXECUTANT</th>
                                    <th style={s.th}>ACȚIUNI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'mytasks' ? myTasks : allTasks).map(task => {
                                    const st = getStatusStyle(task.status);
                                    return (
                                        <tr key={task.id} style={s.tr}>
                                            <td style={s.td}>
                                                <div style={s.taskName}>{task.title}</div>
                                                <div style={s.taskSub}>{task.description.substring(0, 40)}...</div>
                                            </td>
                                            <td style={s.td}>
                                                <span style={{...s.statusBadge, color: st.color, backgroundColor: st.bg}}>
                                                    <div style={{...s.dot, backgroundColor: st.dot}}></div> {task.status}
                                                </span>
                                            </td>
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
                                                {task.status === 'PENDING' && task.assignedTo === user.id && (
                                                    <button style={s.actionBtn} onClick={() => handleAction(task.id, 'complete')}>Gata</button>
                                                )}
                                                {user.role === 'manager' && task.status === 'COMPLETED' && (
                                                    <button style={{...s.actionBtn, backgroundColor: '#1e293b'}} onClick={() => handleAction(task.id, 'close')}>Închide</button>
                                                )}
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

// --- PREMIUM STYLESHEET (GLASS & MODERN) ---
const s = {
    app: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1b2559' },
    sidebar: { width: '290px', backgroundColor: '#fff', padding: '40px 30px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 10 },
    brand: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '50px' },
    logoSquare: { backgroundColor: '#4318FF', width: '35px', height: '35px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
    brandName: { fontSize: '24px', fontWeight: '800', letterSpacing: '-1px' },
    navLabel: { fontSize: '12px', fontWeight: '700', color: '#a3aed0', marginBottom: '20px', marginLeft: '10px' },
    sideNav: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
    navBtn: { border: 'none', background: 'none', padding: '15px', textAlign: 'left', color: '#a3aed0', fontWeight: '600', cursor: 'pointer', display: 'flex', gap: '15px', borderRadius: '15px', transition: '0.3s' },
    navBtnActive: { border: 'none', background: '#fff', padding: '15px', textAlign: 'left', color: '#1b2559', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '15px', borderRadius: '15px', boxShadow: '0px 20px 40px rgba(112, 144, 176, 0.08)' },
    userCard: { marginTop: 'auto', backgroundColor: '#f4f7fe', padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' },
    userAvatar: { width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4318FF' },
    userName: { fontSize: '14px', fontWeight: '700' },
    userRole: { fontSize: '10px', fontWeight: '700', color: '#a3aed0' },
    logoutBtn: { border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' },
    main: { flexGrow: 1, marginLeft: '290px', padding: '40px 50px' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    pageTitle: { fontSize: '34px', fontWeight: '800', margin: 0 },
    breadcrumb: { fontSize: '14px', color: '#707eae' },
    searchBar: { backgroundColor: '#fff', padding: '12px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', width: '300px', boxShadow: '0px 4px 10px rgba(0,0,0,0.02)' },
    searchInput: { border: 'none', outline: 'none', fontSize: '14px', color: '#1b2559', width: '100%' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' },
    kpiCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0px 10px 30px rgba(0,0,0,0.03)' },
    kpiIcon: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#f4f7fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#4318FF' },
    kpiValue: { fontSize: '24px', fontWeight: '800' },
    kpiLabel: { fontSize: '14px', color: '#a3aed0', fontWeight: '600' },
    contentWrapper: { backgroundColor: '#fff', borderRadius: '25px', padding: '30px', boxShadow: '0px 20px 40px rgba(0,0,0,0.02)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', color: '#a3aed0', fontSize: '12px', fontWeight: '700', paddingBottom: '20px', borderBottom: '1px solid #f4f7fe' },
    tr: { borderBottom: '1px solid #f4f7fe' },
    td: { padding: '20px 0', fontSize: '14px' },
    taskName: { fontWeight: '700', color: '#1b2559' },
    taskSub: { fontSize: '12px', color: '#a3aed0' },
    statusBadge: { padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    dot: { width: '8px', height: '8px', borderRadius: '50%' },
    actionBtn: { padding: '8px 20px', backgroundColor: '#4318FF', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
    actionSelect: { padding: '8px', borderRadius: '10px', border: '1px solid #f4f7fe', outline: 'none', fontWeight: '600' },
    teamContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
    memberCard: { padding: '20px', backgroundColor: '#f4f7fe', borderRadius: '20px', textAlign: 'center' },
    memberImg: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', color: '#4318FF' },
    memberName: { fontWeight: '700', fontSize: '16px' },
    memberRole: { fontSize: '11px', color: '#a3aed0', fontWeight: '800' },
    memberStatus: { marginTop: '10px', fontSize: '12px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
    statusPulse: { width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }
};

export default Dashboard;