import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Décode le payload JWT sans lib externe
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const getRole = () => {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = decodeToken(token)
    return payload?.role || null
  }

  const [role, setRole] = useState(getRole)

  const login = (token) => {
    localStorage.setItem('token', token)
    const payload = decodeToken(token)
    setRole(payload?.role || null)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setRole(null)
  }

  const isAdmin        = role === 'admin'
  const isModification = role === 'modification' || role === 'admin'
  const isAuthenticated = !!role

  return (
    <AuthContext.Provider value={{ role, login, logout, isAdmin, isModification, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
