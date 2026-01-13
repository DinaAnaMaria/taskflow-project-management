import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useParams ne ajută să citim ID-ul din URL
import axios from 'axios';

function ProjectDetails() {
    const { id } = useParams(); // Luăm ID-ul proiectului din link
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    // 1. Aducem sarcinile de la server
    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:8080/api/tasks/project/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (err) {
            console.error("Eroare la tasks:", err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [id]);

    // 2. Creăm un Task nou
    const handleCreateTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            // Trimitem datele + ID-ul proiectului
            await axios.post('http://localhost:8080/api/tasks', 
                { ...newTask, projectId: id }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasks(); // Refresh la listă
            setNewTask({ title: '', description: '' }); // Golim formularul
        } catch (err) {
            alert("Nu am putut crea task-ul!");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
                ⬅ Înapoi la Proiecte
            </button>
            
            <h1>Sarcini pentru Proiectul #{id} 📝</h1>

            {/* Formular Adăugare Task */}
            <div style={{ background: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Adaugă Task Nou</h3>
                <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Titlu Task (ex: Baza de date)" 
                        value={newTask.title} 
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                        required
                        style={{ padding: '8px', flex: '1' }}
                    />
                    <input 
                        type="text" 
                        placeholder="Detalii..." 
                        value={newTask.description} 
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                        style={{ padding: '8px', flex: '2' }}
                    />
                    <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>
                        Adaugă
                    </button>
                </form>
            </div>

            {/* Lista de Task-uri */}
            <div>
                {tasks.length === 0 ? <p>Nicio sarcină încă. Ești liber! 😎</p> : tasks.map(task => (
                    <div key={task.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <strong>{task.title}</strong> - <span style={{ color: '#666' }}>{task.description}</span>
                        </div>
                        <span style={{ background: task.status === 'To Do' ? '#ffc107' : '#28a745', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            {task.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProjectDetails;