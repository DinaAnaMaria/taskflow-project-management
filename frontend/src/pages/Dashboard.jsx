import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    
    // --- CONFIGURARE API ---
    // Înlocuiește cu URL-ul tău de backend de pe Render
    const API_URL ="https://taskflow-api-qkmb.onrender.com"; 

    // State
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [myTasks, setMyTasks] = useState([]); 
    const [currentUser, setCurrentUser] = useState({});
    const [activeTab, setActiveTab] = useState('overview'); 
    const [showForm, setShowForm] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');
            
            try {
                // Decodare token pentru a lua rolul și numele utilizatorului
                const payload = token.split('.')[1];
                const userData = JSON.parse(atob(payload));
                setCurrentUser(userData);

                const headers = { Authorization: `Bearer ${token}` };

                // 1. Proiecte
                const projRes = await axios.get(`${API_URL}/projects`, { headers });
                setProjects(projRes.data);

                // 2. Useri (Doar dacă e Admin/Manager)
                if (userData.role === 'admin' || userData.role === 'manager') {
                    const userRes = await axios.get(`${API_URL}/users`, { headers });
                    setUsers(userRes.data);
                }

                // 3. Sarcinile Mele
                const taskRes = await axios.get(`${API_URL}/my-tasks`, { headers });
                setMyTasks(taskRes.data);

            } catch (err) {
                console.error("Eroare la preluarea datelor:", err);
                if(err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };
        fetchData();
    }, [navigate]);

    // --- ACTIONS ---
    const handleCreateProject = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${API_URL}/projects`, newProject, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects([...projects, res.data]); // Update listă fără reload
            setNewProject({ name: '', description: '' });
            setShowForm(false);
        } catch (err) { alert('Eroare la creare proiect'); }
    };

    const handleDeleteProject = async (id) => {
        if(!window.confirm("Ești sigur? Se vor șterge și toate sarcinile din acest proiect!")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/projects/${id}`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) { alert('Eroare la ștergere proiect'); }
    };

    const handleDeleteUser = async (userId) => {
        if(!window.confirm("Ești sigur că vrei să elimini acest utilizator?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/admin/users/${userId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) { alert('Eroare: Nu ai drepturi sau serverul a refuzat cererea.'); }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- RENDER VIEWS ---

    const renderOverview = () => (
        <div className="row g-4 animate__animated animate__fadeIn p-4">
            <div className="col-md-4">
                <div className="modern-card p-4 d-flex align-items-center gap-3 border-primary border-start border-4">
                    <div className="bg-primary-subtle text-primary rounded p-3">📅</div>
                    <div>
                        <h3 className="fw-bold m-0">{myTasks.filter(t => t.status !== 'CLOSED').length}</h3>
                        <p className="text-muted m-0 small fw-bold">SARCINI ACTIVE</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="modern-card p-4 d-flex align-items-center gap-3 border-info border-start border-4">
                    <div className="bg-light text-dark rounded p-3 border">📁</div>
                    <div>
                        <h3 className="fw-bold m-0">{projects.length}</h3>
                        <p className="text-muted m-0 small fw-bold">PROIECTE</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="modern-card p-4 d-flex align-items-center gap-3 border-success border-start border-4">
                    <div className="bg-light text-dark rounded p-3 border">👥</div>
                    <div>
                        <h3 className="fw-bold m-0">{users.length}</h3>
                        <p className="text-muted m-0 small fw-bold">ECHIPĂ</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMyTasks = () => (
        <div className="p-4 animate__animated animate__fadeIn">
            <h4 className="fw-bold mb-4">Sarcini Alocate Mie</h4>
            <div className="row g-3">
                {myTasks.map(task => (
                    <div key={task.id} className="col-md-6">
                        <div className={`modern-card p-3 border-start border-4 ${task.status === 'COMPLETED' ? 'border-success' : 'border-warning'}`}>
                            <div className="d-flex justify-content-between">
                                <h6 className="fw-bold">{task.title}</h6>
                                <span className="badge bg-light text-dark border">{task.status}</span>
                            </div>
                            <p className="small text-muted">{task.description}</p>
                        </div>
                    </div>
                ))}
                {myTasks.length === 0 && <p className="text-muted">Nu ai sarcini alocate încă.</p>}
            </div>
        </div>
    );

    const renderProjects = () => (
        <div className="p-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">Proiecte Active</h4>
                {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Anulează' : '+ Proiect Nou'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="modern-card mb-4 p-4 bg-light border-0">
                    <form onSubmit={handleCreateProject} className="row g-3">
                        <div className="col-md-5">
                            <input type="text" className="form-control" placeholder="Nume Proiect" 
                                value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
                        </div>
                        <div className="col-md-5">
                            <input type="text" className="form-control" placeholder="Descriere" 
                                value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-success w-100">Creează</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-4">
                {projects.map(proj => (
                    <div key={proj.id} className="col-md-6">
                        <div className="modern-card p-3 shadow-sm">
                            <div className="d-flex justify-content-between">
                                <h6 className="fw-bold">{proj.name}</h6>
                                {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                                    <button onClick={() => handleDeleteProject(proj.id)} className="btn btn-sm text-danger">Șterge</button>
                                )}
                            </div>
                            <p className="text-muted small">{proj.description}</p>
                            <button onClick={() => navigate(`/project/${proj.id}`)} className="btn btn-sm btn-outline-primary">Vezi Detalii</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTeam = () => (
        <div className="p-4 animate__animated animate__fadeIn">
            <h4 className="fw-bold mb-4">Membrii Echipei</h4>
            <div className="row g-3">
                {users.map(u => (
                    <div key={u.id} className="col-md-4">
                        <div className="modern-card p-3 d-flex justify-content-between align-items-center shadow-sm">
                            <div>
                                <h6 className="fw-bold m-0">{u.firstName} {u.lastName}</h6>
                                <small className="badge bg-light text-secondary border">{u.role}</small>
                            </div>
                            {currentUser.role === 'admin' && u.id !== currentUser.id && (
                                <button onClick={() => handleDeleteUser(u.id)} className="btn btn-sm text-danger">Elimină</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
            {/* SIDEBAR */}
            <div style={{ width: '260px', background: 'white', borderRight: '1px solid #eee', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3 className="fw-bold text-primary mb-5">TaskFlow</h3>
                <nav className="nav flex-column gap-2 flex-grow-1">
                    <button className={`btn text-start ${activeTab === 'overview' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    <button className={`btn text-start ${activeTab === 'mytasks' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('mytasks')}>✅ My Tasks</button>
                    <button className={`btn text-start ${activeTab === 'projects' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('projects')}>📂 Projects</button>
                    <button className={`btn text-start ${activeTab === 'team' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('team')}>👥 Team</button>
                </nav>
                <div className="border-top pt-3">
                    <p className="small mb-1"><strong>{currentUser.name}</strong></p>
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-danger w-100">Deconectare</button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ flexGrow: 1 }}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'mytasks' && renderMyTasks()}
                {activeTab === 'projects' && renderProjects()}
                {activeTab === 'team' && renderTeam()}
            </div>
        </div>
    );
}

export default Dashboard;