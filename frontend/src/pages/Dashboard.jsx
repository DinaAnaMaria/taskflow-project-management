import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    
    // State
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [myTasks, setMyTasks] = useState([]); 
    const [currentUser, setCurrentUser] = useState({});
    
    // Navigare Tab-uri
    const [activeTab, setActiveTab] = useState('overview'); 
    const [showForm, setShowForm] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');
            
            const userData = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser(userData);

            try {
                const headers = { Authorization: `Bearer ${token}` };

                // 1. Proiecte
                const projRes = await axios.get('http://localhost:8080/api/projects', { headers });
                setProjects(projRes.data);

                // 2. Useri
                const userRes = await axios.get('http://localhost:8080/api/users', { headers });
                setUsers(userRes.data);

                // 3. Sarcinile Mele (Istoric Complet)
                const taskRes = await axios.get('http://localhost:8080/api/my-tasks', { headers });
                setMyTasks(taskRes.data);

            } catch (err) {
                console.error(err);
                if(err.response?.status === 401) navigate('/login');
            }
        };
        fetchData();
    }, [navigate]);

    // --- ACTIONS ---
    const handleCreateProject = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/api/projects', newProject, { headers: { Authorization: `Bearer ${token}` }});
            window.location.reload();
        } catch (err) { alert('Eroare'); }
    };

    const handleDeleteProject = async (id) => {
        if(!window.confirm("Ești sigur? Se vor șterge și toate sarcinile din acest proiect!")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8080/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` }});
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) { alert('Eroare la ștergere'); }
    };

    // Funcția nouă de ștergere Useri
    const handleDeleteUser = async (userId) => {
        if(!window.confirm("Ești sigur că vrei să elimini acest utilizator?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) { alert('Eroare: Nu ai drepturi sau ceva a mers prost.'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- VIEWS ---

    const renderOverview = () => (
        <div className="row g-4 animate__animated animate__fadeIn">
            <div className="col-md-4">
                <div className="modern-card p-4 d-flex align-items-center gap-3 border-primary border-start border-4">
                    <div className="bg-primary-subtle text-primary rounded p-3"><i className="bi bi-list-check fs-4"></i></div>
                    <div>
                        <h3 className="fw-bold m-0">{myTasks.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length}</h3>
                        <p className="text-muted m-0 small fw-bold">SARCINI ACTIVE</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="modern-card p-4 d-flex align-items-center gap-3">
                    <div className="bg-light text-dark rounded p-3 border"><i className="bi bi-folder-fill fs-4"></i></div>
                    <div>
                        <h3 className="fw-bold m-0">{projects.length}</h3>
                        <p className="text-muted m-0 small fw-bold">PROIECTE TOTALE</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="modern-card p-4 d-flex align-items-center gap-3">
                    <div className="bg-light text-dark rounded p-3 border"><i className="bi bi-people-fill fs-4"></i></div>
                    <div>
                        <h3 className="fw-bold m-0">{users.length}</h3>
                        <p className="text-muted m-0 small fw-bold">MEMBRI ECHIPĂ</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMyTasks = () => {
        const activeTasks = myTasks.filter(t => t.status === 'OPEN' || t.status === 'PENDING');
        const historyTasks = myTasks.filter(t => t.status === 'COMPLETED' || t.status === 'CLOSED');

        return (
            <div className="animate__animated animate__fadeIn">
                <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-check2-circle text-primary"></i> Sarcinile Mele
                </h4>
                
                {/* ACTIVE */}
                <h6 className="text-muted fw-bold mb-3 border-bottom pb-2">ÎN LUCRU ({activeTasks.length})</h6>
                {activeTasks.length === 0 ? (
                    <div className="text-center py-4 text-muted border rounded bg-white mb-4">
                        Nu ai sarcini active.
                    </div>
                ) : (
                    <div className="row g-3 mb-5">
                        {activeTasks.map(task => (
                            <div key={task.id} className="col-md-6 col-xl-4">
                                <div className="modern-card h-100 p-3 border-warning border-start border-4 interactive" 
                                     onClick={() => navigate(`/project/${task.projectId}`)} style={{cursor: 'pointer'}}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="badge bg-light text-secondary border">{task.Project?.name}</span>
                                        <span className={`badge-modern status-${task.status}`}>{task.status}</span>
                                    </div>
                                    <h6 className="fw-bold mb-1">{task.title}</h6>
                                    <p className="text-muted small mb-0 text-truncate">{task.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ISTORIC */}
                <h6 className="text-muted fw-bold mb-3 border-bottom pb-2 mt-4">ISTORIC / FINALIZATE ({historyTasks.length})</h6>
                <div className="row g-3">
                    {historyTasks.map(task => (
                        <div key={task.id} className="col-md-6 col-xl-4">
                            <div className="modern-card h-100 p-3 border-success border-start border-4 opacity-75" style={{background: '#f8f9fa'}}>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="badge bg-white text-muted border">{task.Project?.name}</span>
                                    <span className={`badge-modern status-${task.status}`}>{task.status}</span>
                                </div>
                                <h6 className="fw-bold mb-1 text-muted text-decoration-line-through">{task.title}</h6>
                                <p className="text-muted small mb-0">Ultima actualizare: {new Date(task.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderProjects = () => (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">Proiecte Active</h4>
                {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                    <button className="btn-primary-modern" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Anulează' : '+ Proiect Nou'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="modern-card mb-4 p-4 bg-light border-0">
                    <form onSubmit={handleCreateProject} className="row g-3">
                        <div className="col-md-4">
                            <input type="text" className="input-modern" placeholder="Nume Proiect" 
                                value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
                        </div>
                        <div className="col-md-6">
                            <input type="text" className="input-modern" placeholder="Descriere..." 
                                value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                        </div>
                        <div className="col-md-2">
                            <button className="btn-primary-modern w-100 h-100">Creează</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="row g-4">
                {projects.map(proj => (
                    <div key={proj.id} className="col-md-6 col-xl-4">
                        <div className="modern-card h-100 d-flex flex-column" style={{position: 'relative'}}>
                            
                            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                                    className="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-3 border hover-danger"
                                    title="Șterge Proiect"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            )}

                            <div className="d-flex justify-content-between mb-3 pt-2 px-2 interactive" 
                                 onClick={() => navigate(`/project/${proj.id}`)} style={{cursor: 'pointer'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded bg-light p-2 text-primary border">
                                        <i className="bi bi-briefcase fs-5"></i>
                                    </div>
                                    <h6 className="fw-bold m-0 text-dark">{proj.name}</h6>
                                </div>
                            </div>
                            <p className="text-muted small flex-grow-1 px-2">{proj.description}</p>
                            <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center px-2">
                                <span className="badge bg-light text-dark border px-2">
                                    {proj.Tasks ? proj.Tasks.length : 0} Sarcini
                                </span>
                                <button onClick={() => navigate(`/project/${proj.id}`)} className="btn btn-sm text-primary fw-bold">
                                    Deschide <i className="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTeam = () => (
        <div className="animate__animated animate__fadeIn">
            <h4 className="fw-bold mb-4">Membrii Echipei ({users.length})</h4>
            <div className="row g-3">
                {users.map(u => (
                    <div key={u.id} className="col-md-6 col-lg-4">
                        <div className="modern-card p-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold 
                                    ${u.role === 'admin' ? 'bg-danger' : u.role === 'manager' ? 'bg-primary' : 'bg-secondary'}`} 
                                    style={{width: 45, height: 45, fontSize: '1.2rem'}}>
                                    {u.firstName.charAt(0)}
                                </div>
                                <div>
                                    <h6 className="fw-bold m-0">{u.firstName} {u.lastName}</h6>
                                    <span className="badge bg-light text-dark border">{u.role.toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Buton Ștergere User (Doar Admin) */}
                            {currentUser.role === 'admin' && u.id !== currentUser.id && (
                                <button onClick={() => handleDeleteUser(u.id)} className="btn btn-sm btn-outline-danger border-0" title="Elimină Utilizator">
                                    <i className="bi bi-trash"></i>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="d-flex">
            {/* SIDEBAR */}
            <div className="sidebar">
                <div className="mb-5 px-2">
                    <h5 className="fw-bold text-dark d-flex align-items-center gap-2">
                        <div className="bg-primary text-white rounded p-1"><i className="bi bi-lightning-fill"></i></div>
                        TaskFlow
                    </h5>
                </div>
                
                <nav className="d-flex flex-column gap-1 flex-grow-1">
                    <button onClick={() => setActiveTab('overview')} 
                        className={`nav-link-custom border-0 bg-transparent w-100 text-start ${activeTab === 'overview' ? 'active' : ''}`}>
                        <i className="bi bi-grid"></i> Privire de ansamblu
                    </button>
                    
                    <button onClick={() => setActiveTab('mytasks')} 
                        className={`nav-link-custom border-0 bg-transparent w-100 text-start ${activeTab === 'mytasks' ? 'active' : ''}`}>
                        <i className="bi bi-check2-square"></i> Sarcinile Mele
                    </button>

                    <button onClick={() => setActiveTab('projects')} 
                        className={`nav-link-custom border-0 bg-transparent w-100 text-start ${activeTab === 'projects' ? 'active' : ''}`}>
                        <i className="bi bi-folder"></i> Proiecte
                    </button>
                    
                    <button onClick={() => setActiveTab('team')} 
                        className={`nav-link-custom border-0 bg-transparent w-100 text-start ${activeTab === 'team' ? 'active' : ''}`}>
                        <i className="bi bi-people"></i> Echipă
                    </button>
                </nav>

                <div className="mt-auto border-top pt-3">
                    <div className="d-flex align-items-center gap-2 mb-3 px-2">
                        <div className="bg-light rounded-circle border d-flex justify-content-center align-items-center" style={{width: 35, height: 35}}>
                            <i className="bi bi-person text-secondary"></i>
                        </div>
                        <div style={{lineHeight: '1.2', overflow: 'hidden'}}>
                            <div className="fw-bold text-truncate" style={{fontSize: '0.85rem'}}>{currentUser.name}</div>
                            <small className="text-muted" style={{fontSize: '0.7rem'}}>{currentUser.role?.toUpperCase()}</small>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-danger w-100 border-0 text-start px-2">
                        <i className="bi bi-box-arrow-right me-2"></i> Deconectare
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content" style={{background: '#f9fafb', minHeight: '100vh', width: '100%'}}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'mytasks' && renderMyTasks()}
                {activeTab === 'projects' && renderProjects()}
                {activeTab === 'team' && renderTeam()}
            </div>
        </div>
    );
}

export default Dashboard;