import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]); // Aici ținem lista de proiecte
    const [newProject, setNewProject] = useState({ name: '', description: '' }); // Formularul
    const [error, setError] = useState('');

    // 1. Funcția care aduce proiectele de la server
    const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Dacă nu are bilet, afară!
            return;
        }

        try {
            // Trimitem Token-ul în Header ca să știe serverul cine suntem
            const response = await axios.get('http://localhost:8080/api/projects', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data); // Salvăm proiectele primite
        } catch (err) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                // Dacă tokenul a expirat
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    // 2. Funcția care se activează automat când intrăm pe pagină
    useEffect(() => {
        fetchProjects();
    }, []);

    // 3. Funcția pentru crearea unui proiect nou
    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/api/projects', newProject, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // După ce l-am creat, reîmprospătăm lista și golim formularul
            fetchProjects(); 
            setNewProject({ name: '', description: '' });
        } catch (err) {
            setError('Nu am putut crea proiectul!');
        }
    };

    // 4. Funcția de deconectare
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
            
            {/* Header cu buton de logout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Proiectele Tale 📂</h1>
                <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                    Deconectare
                </button>
            </div>

            {/* Formular de adăugare */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>Adaugă un Proiect Nou</h3>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        placeholder="Nume Proiect" 
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        required
                        style={{ padding: '10px', flex: '1', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <input 
                        type="text" 
                        placeholder="Scurtă descriere" 
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        style={{ padding: '10px', flex: '2', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                    <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
                        + Creează
                    </button>
                </form>
            </div>

            {/* Lista de Proiecte */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {projects.length === 0 ? (
                    <p>Nu ai niciun proiect momentan.</p>
                ) : (
                    projects.map((proj) => (
                        <div key={proj.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{proj.name}</h3>
                            <p style={{ color: '#666', fontSize: '14px' }}>{proj.description}</p>
                            <span style={{ background: '#e9ecef', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                Status: {proj.status}
                            </span>
                            <div style={{ marginTop: '15px' }}>
                                <button 
                                     onClick={() => navigate(`/project/${proj.id}`)} 
                                     style={{ width: '100%', padding: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                     Vezi Sarcini (Tasks)
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;