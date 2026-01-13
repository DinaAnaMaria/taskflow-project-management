import React from 'react';
import ProjectDetails from './pages/ProjectDetails';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Importăm paginile create
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Bara de Meniu de sus */}
      <nav style={{ padding: '15px', background: '#333', color: 'white', marginBottom: '20px' }}>
        <Link to="/register" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Înregistrare</Link>
        <Link to="/login" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Logare</Link>
        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
      </nav>

      {/* Aici se schimbă paginile în funcție de link */}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        {/* Dacă intră pe pagina principală, îl trimitem la Login */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;