import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/LoginPage.jsx';
import Actionneurs from './pages/Actionneurs.jsx';
import Seuils from './pages/Seuils.jsx';
import Sidebar from './components/Sidebar.jsx';
import { useUser } from './context/UserContext.jsx';

function App() {
  const location = useLocation();
  const { user, loading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Détermine si la sidebar doit s'afficher
  // Si on est authentifié (user existe) et qu'on n'est pas sur la page de login
  const isAuth = !!user;
  const showSidebar = isAuth && location.pathname !== "/";

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Fermer la sidebar si on repasse en mode bureau
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div className="spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      {showSidebar && (
        <>
          <button className="menu-toggle" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </>
      )}
      <div className={`app-content ${showSidebar ? "main-wrapper" : "auth-wrapper"}`}>
        <Routes>
          <Route path="/" element={isAuth ? <Navigate to="/dashboard" /> : <Login onLogin={() => {}} />} />
          <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/actionneurs" element={isAuth ? <Actionneurs /> : <Navigate to="/" />} />
          <Route path="/seuils" element={isAuth ? <Seuils /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}
export default App;