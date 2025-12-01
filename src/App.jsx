import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/commonComponents/Navbar'
import ProtectedRoute from './components/commonComponents/ProtectedRoute'

import Home from './pages/Home'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import ChatPage from './pages/ChatPage'
import PatientAppointmentsPage from './pages/PatientAppointmentsPage'
import PatientMedicationsPage from './pages/PatientMedicationsPage'
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage'
import DoctorAvailabilityPage from './pages/DoctorAvailabilityPage'
import DoctorMedicationsPage from './pages/DoctorMedicationsPage'

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* patient dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* doctor dashboard */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor']}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientAppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/availability"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorAvailabilityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/medications"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorMedicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medications"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientMedicationsPage />
              </ProtectedRoute>
            }
          />
                    
          
          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
