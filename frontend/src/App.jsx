import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/LoginPage.jsx';
import Actionneurs from './pages/Actionneurs.jsx';
import Seuils from './pages/Seuils.jsx';
import Sidebar from './components/Sidebar.jsx';
import './styles/dashboard.css';

function App() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isAuth = localStorage.getItem('auth') === 'true';
  const isLoginPage = location.pathname === '/';
  const showSidebar = isAuth && !isLoginPage;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

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
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/actionneurs" element={isAuth ? <Actionneurs /> : <Navigate to="/" />} />
          <Route path="/seuils" element={isAuth ? <Seuils /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}
export default App;