import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow px-8 py-10 text-center max-w-md">
          <p className="text-4xl mb-3">🚫</p>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            You are not allowed to view this page
          </h1>
          <p className="text-sm text-slate-600">
            Try switching account or go back to the home page.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
