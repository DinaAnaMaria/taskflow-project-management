import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// Importăm paginile
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import ForgotPassword from './pages/ForgotPassword'; 
import ResetPassword from './pages/ResetPassword';
import AdminPanel from './pages/AdminPanel'; // <--- IMPORTUL PENTRU ADMIN
import './App.css';

function MainLayout() {
  const location = useLocation();
  
  // Am adăugat și /admin aici pentru a ascunde navbar-ul de landing
  const hideNavbarPaths = ['/dashboard', '/project', '/admin'];
  const isAppPage = hideNavbarPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {!isAppPage && (
        <nav className="navbar navbar-expand-lg bg-white border-bottom fixed-top px-4" style={{height: '70px', zIndex: 1000}}>
          <div className="container-fluid">
            <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark" to="/">
              <div className="d-flex align-items-center justify-content-center rounded bg-primary text-white" style={{width: 32, height: 32}}>
                <i className="bi bi-lightning-fill" style={{fontSize: '1rem'}}></i>
              </div>
              <span style={{letterSpacing: '-0.5px'}}>TaskFlow</span>
            </Link>
            <div className="d-flex gap-3 align-items-center">
              <Link to="/login" className="btn-secondary-modern">Logare</Link>
              <Link to="/register" className="btn-primary-modern">Înregistrare</Link>
            </div>
          </div>
        </nav>
      )}

      <div style={{ paddingTop: isAppPage ? '0' : '70px' }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          
          {/* --- RUTA PENTRU ADMIN --- */}
          <Route path="/admin" element={<AdminPanel />} />
          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;