import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Error parsing user from storage', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const goToDashboard = (u) => {
    if (u.role === 'doctor') {
      navigate('/doctor/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      // data.user now includes role and doctorStatus
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      goToDashboard(data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      }
    }
  }

  const register = async (name, email, password, preferredLanguage = 'en') => {
    try {
      const data = await authService.register(
        name,
        email,
        password,
        preferredLanguage
      )
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      goToDashboard(data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { AuthProvider, useAuth }
