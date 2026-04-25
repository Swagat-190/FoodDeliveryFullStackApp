// context/AuthContext.jsx
// Global authentication state — wraps the whole app
// Any component can call useAuth() to access user state and auth functions

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/services'
import { getApiErrorMessage } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialize from localStorage so user stays logged in on refresh
  const [token, setToken]     = useState(() => localStorage.getItem('token') || null)
  const [user, setUser]       = useState(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (!token || !saved) return null
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      if (user) setUser(null)
    }
  }, [user, token])

  /** Register new account */
  const register = async (name, email, mobileNumber, password, role) => {
    setLoading(true)
    try {
      const res = await authAPI.register({ name, email, mobileNumber, password, role })
      const { token: tok, ...userInfo } = res.data.data
      setToken(tok)
      setUser(userInfo)
      return { success: true }
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Registration failed') }
    } finally {
      setLoading(false)
    }
  }

  /** Login with email + password */
  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { token: tok, ...userInfo } = res.data.data
      setToken(tok)
      setUser(userInfo)
      return { success: true }
    } catch (err) {
      return { success: false, message: getApiErrorMessage(err, 'Invalid credentials') }
    } finally {
      setLoading(false)
    }
  }

  /** Clear state and localStorage */
  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Custom hook — use this in any component instead of useContext(AuthContext) */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
