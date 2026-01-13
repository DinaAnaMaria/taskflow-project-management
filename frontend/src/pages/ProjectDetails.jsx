import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State
    const [projectTitle, setProjectTitle] = useState(''); // Pentru titlul proiectului
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetch = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');
            
            const userPayload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUser(userPayload);

            try {
                // 1. Luăm lista de proiecte pentru a găsi numele proiectului curent
                // (O soluție rapidă, ideal ar fi un endpoint separat /api/projects/:id)
                const projRes = await axios.get('http://localhost:8080/api/projects', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentProj = projRes.data.find(p => p.id === parseInt(id));
                if (currentProj) setProjectTitle(currentProj.name);

                // 2. Luăm Task-urile
                const tRes = await axios.get(`http://localhost:8080/api/tasks/project/${id}`, { headers: { Authorization: `Bearer ${token}` }});
                setTasks(tRes.data);
                
                // 3. Luăm Userii (doar dacă nu ești executant, ca să poți aloca)
                if (userPayload.role !== 'executant') {
                    const uRes = await axios.get('http://localhost:8080/api/users', { headers: { Authorization: `Bearer ${token}` }});
                    setUsers(uRes.data);
                }
                setLoading(false);
            } catch (e) { 
                console.error(e);
                setLoading(false);
            }
        };
        fetch();
    }, [id, navigate]);

    // --- ACTIONS ---
    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/api/tasks', { ...newTask, projectId: id }, { headers: { Authorization: `Bearer ${token}` }});
            window.location.reload();
        } catch (err) { alert('Eroare creare task'); }
    };

    const updateStatus = async (taskId, endpoint, body = {}) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8080/api/tasks/${taskId}/${endpoint}`, body, { headers: { Authorization: `Bearer ${token}` }});
            // Update local (optimist) ca să nu dăm reload paginii
            window.location.reload();
        } catch (err) { alert('Eroare actualizare'); }
    };

    if (loading) return <div className="p-5 text-center text-muted">Se încarcă datele proiectului...</div>;

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            
            {/* HEADER PROIECT - Stil "Header Bar" */}
            <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm" style={{position: 'sticky', top: 0, zIndex: 100}}>
                <div className="d-flex align-items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-light border btn-sm d-flex align-items-center gap-2 text-muted hover-dark">
                        <i className="bi bi-arrow-left"></i> Înapoi
                    </button>
                    <div className="vr"></div>
                    <div>
                        <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                            <i className="bi bi-briefcase text-primary"></i>
                            {projectTitle || "Proiect #" + id}
                        </h5>
                    </div>
                </div>
                
                <span className="badge bg-light text-dark border px-3 py-2">
                    Logat ca: <span className="fw-bold text-primary">{currentUser.role.toUpperCase()}</span>
                </span>
            </div>

            <div className="container-fluid p-4">
                <div className="row g-4">
                    
                    {/* ZONA DE CONTROL (Stânga - Doar Manager) */}
                    {currentUser.role === 'manager' && (
                        <div className="col-lg-3">
                            <div className="modern-card p-4 sticky-top" style={{top: '90px'}}>
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <i className="bi bi-plus-circle-fill text-primary"></i> Sarcină Nouă
                                </h6>
                                <form onSubmit={handleCreate}>
                                    <div className="mb-3">
                                        <label className="text-muted small fw-bold">TITLU</label>
                                        <input className="input-modern" 
                                            value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted small fw-bold">DESCRIERE</label>
                                        <textarea className="input-modern" rows="3" 
                                            value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted small fw-bold">PRIORITATE</label>
                                        <select className="input-modern" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                                            <option value="medium">Medie</option>
                                            <option value="high">Urgent 🔴</option>
                                            <option value="low">Scăzută 🟢</option>
                                        </select>
                                    </div>
                                    <button className="btn-primary-modern w-100">Adaugă în listă</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* LISTA DE TASK-URI (Dreapta) */}
                    <div className={currentUser.role === 'manager' ? 'col-lg-9' : 'col-12'}>
                        {tasks.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-clipboard-check fs-1 mb-3 d-block"></i>
                                Nu există sarcini în acest proiect.
                            </div>
                        ) : (
                            <div className="row">
                                {tasks.map(task => (
                                    <div key={task.id} className="col-md-6 mb-4">
                                        <div className={`modern-card h-100 p-4 border-start border-4 
                                            ${task.status === 'COMPLETED' ? 'border-success' : 
                                              task.status === 'CLOSED' ? 'border-secondary' : 
                                              task.status === 'PENDING' ? 'border-warning' : 'border-primary'}`}>
                                            
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className={`badge-modern status-${task.status}`}>
                                                    {task.status}
                                                </span>
                                                {task.priority === 'high' && <span className="text-danger small fw-bold"><i className="bi bi-exclamation-circle-fill"></i> URGENT</span>}
                                            </div>
                                            
                                            <h5 className="fw-bold text-dark mt-2">{task.title}</h5>
                                            <p className="text-muted small mb-4">{task.description}</p>
                                            
                                            <div className="d-flex justify-content-between align-items-end mt-auto pt-3 border-top">
                                                <div>
                                                    <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>RESPONSABIL</small>
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <div className="bg-light rounded-circle border d-flex justify-content-center align-items-center" style={{width: 24, height: 24}}>
                                                            <i className="bi bi-person-fill text-secondary" style={{fontSize: '0.7rem'}}></i>
                                                        </div>
                                                        <span className="fw-medium small text-dark">
                                                            {task.executor ? `${task.executor.firstName} ${task.executor.lastName}` : 'Nealocat'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* --- BUTOANE DE ACȚIUNE --- */}
                                                <div>
                                                    {/* Manager: Alocă user */}
                                                    {currentUser.role === 'manager' && task.status === 'OPEN' && (
                                                        <select className="form-select form-select-sm" style={{width: '140px', fontSize: '0.8rem'}}
                                                            onChange={(e) => updateStatus(task.id, 'assign', { assignedTo: e.target.value })}>
                                                            <option value="">+ Alocă...</option>
                                                            {users.filter(u => u.role === 'executant').map(u => (
                                                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    {/* Executant: Finalizează */}
                                                    {currentUser.role === 'executant' && task.status === 'PENDING' && task.assignedTo === currentUser.id && (
                                                        <button onClick={() => updateStatus(task.id, 'complete')} className="btn btn-sm btn-success text-white fw-bold">
                                                            <i className="bi bi-check-lg"></i> Finalizează
                                                        </button>
                                                    )}

                                                    {/* Manager: Închide */}
                                                    {currentUser.role === 'manager' && task.status === 'COMPLETED' && (
                                                        <button onClick={() => updateStatus(task.id, 'close')} className="btn btn-sm btn-outline-secondary">
                                                            <i className="bi bi-archive-fill"></i> Arhivează
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetails;