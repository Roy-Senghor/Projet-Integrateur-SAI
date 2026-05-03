import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar      from './components/Sidebar'
import LoginPage    from './pages/LoginPage'
import Dashboard    from './pages/Dashboard'
import Actionneurs  from './pages/Actionneurs'
import Seuils       from './pages/Seuils'
import Historique   from './pages/Historique'
import Parametres   from './pages/Parametres'
import Utilisateurs from './pages/Utilisateurs'
import './styles/global.css'

// Garde de route avec vérification de rôle
const PrivateRoute = ({ children, requireAdmin = false, requireModification = false }) => {
  const { isAuthenticated, isAdmin, isModification } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" />
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" />
  if (requireModification && !isModification) return <Navigate to="/dashboard" />
  return children
}

function App() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebar] = useState(false)
  const [alertCount,  setAlertCount] = useState(0)

  const showSidebar = isAuthenticated && location.pathname !== '/'

  useEffect(() => { setSidebar(false) }, [location.pathname])

  return (
    <>
      {showSidebar && (
        <>
          <button className="menu-toggle" onClick={() => setSidebar(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebar(false)}/>}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebar(false)} alertCount={alertCount}/>
        </>
      )}

      <div className={showSidebar ? 'main-wrapper' : 'auth-wrapper'}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard"/> : <LoginPage/>}/>

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard setAlertCount={setAlertCount}/></PrivateRoute>
          }/>

          <Route path="/actionneurs" element={
            <PrivateRoute><Actionneurs/></PrivateRoute>
          }/>

          <Route path="/seuils" element={
            <PrivateRoute><Seuils/></PrivateRoute>
          }/>

          <Route path="/historique" element={
            <PrivateRoute><Historique setAlertCount={setAlertCount}/></PrivateRoute>
          }/>

          <Route path="/parametres" element={
            <PrivateRoute><Parametres/></PrivateRoute>
          }/>

          <Route path="/utilisateurs" element={
            <PrivateRoute requireAdmin={true}><Utilisateurs/></PrivateRoute>
          }/>

          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
