import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskHistory = () => {
    const [history, setHistory] = useState([]);
    const [executants, setExecutants] = useState([]);
    const [selectedExecutant, setSelectedExecutant] = useState('');
    
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const API_URL = "https://taskflow-api-qkmb.onrender.com/api";
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (user.role === 'user' || user.role === 'executant') {
            fetchMyHistory();
        } else {
            fetchExecutants();
        }
    }, []);

    const fetchMyHistory = async () => {
        const res = await axios.get(`${API_URL}/my-history`, { headers });
        setHistory(res.data);
    };

    const fetchExecutants = async () => {
        const res = await axios.get(`${API_URL}/users`, { headers });
        setExecutants(res.data.filter(u => u.role === 'executant'));
    };

    const viewExecutantHistory = async (id) => {
        setSelectedExecutant(id);
        const res = await axios.get(`${API_URL}/manager/history/${id}`, { headers });
        setHistory(res.data);
    };

    return (
        <div className="p-6">
            <h2>📜 Istoric Task-uri</h2>

            {/* Selector pentru Manageri */}
            {(user.role === 'manager' || user.role === 'admin') && (
                <div className="mb-6">
                    <label>Consultă istoricul unui executant: </label>
                    <select onChange={(e) => viewExecutantHistory(e.target.value)}>
                        <option value="">Alege utilizator...</option>
                        {executants.map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Tabelul de Istoric */}
            <table className="min-w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Data</th>
                        <th className="border p-2">Task</th>
                        <th className="border p-2">Status Final</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(task => (
                        <tr key={task.id}>
                            <td className="border p-2">{new Date(task.updatedAt).toLocaleDateString()}</td>
                            <td className="border p-2">{task.title}</td>
                            <td className={`border p-2 font-bold ${task.status === 'CLOSED' ? 'text-gray-500' : 'text-green-600'}`}>
                                {task.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TaskHistory;