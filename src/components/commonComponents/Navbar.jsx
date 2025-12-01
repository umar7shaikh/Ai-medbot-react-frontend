import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, MessageSquare, LogOut, User } from 'lucide-react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/chat', label: 'AI Chat' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/medications', label: 'Medications' },
  ]

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/availability', label: 'Availability' },
    { to: '/doctor/medications', label: 'Medications' },
  ]

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks

  const handleLogoClick = () => {
    if (user) {
      if (user.role === 'doctor') navigate('/doctor/dashboard')
      else navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              MedBot
            </span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            {user &&
              links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}

            {!user && (
              <>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Login
                </button>
                <button
                  onClick={() => setRegisterOpen(true)}
                  className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </button>
              </>
            )}

            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-700"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
              {user &&
                links.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-medium text-slate-700 py-1"
                  >
                    {link.label}
                  </Link>
                ))}

              {!user && (
                <>
                  <button
                    onClick={() => {
                      setLoginOpen(true)
                      setMobileOpen(false)
                    }}
                    className="block w-full text-left text-sm font-medium text-blue-600 py-1"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setRegisterOpen(true)
                      setMobileOpen(false)
                    }}
                    className="block w-full text-left text-sm font-medium text-white bg-blue-600 rounded-md px-3 py-1.5 mt-1"
                  >
                    Sign up
                  </button>
                </>
              )}

              {user && (
                <button
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false)
          setRegisterOpen(true)
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false)
          setLoginOpen(true)
        }}
      />
    </>
  )
}

export default Navbar
