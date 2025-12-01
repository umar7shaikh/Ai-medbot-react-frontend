import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  Clock,
  User,
  Users,
  MessageSquare,
  Stethoscope,
  AlertCircle,
  FileText,
} from 'lucide-react'
import api from '../services/api'

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState([])
  const [uniquePatients, setUniquePatients] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        setLoading(true)

        const apptRes = await api.get('/appointments/doctor')
        const appointmentsData = apptRes.data || []

        // Calculate unique patients count
        const patientIds = new Set()
        appointmentsData.forEach(apt => {
          if (apt.patient?._id) patientIds.add(apt.patient._id)
        })
        setUniquePatients(patientIds.size)

        setAppointments(appointmentsData)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const now = new Date()

  // Upcoming appointments (next 3 pending)
  const upcomingAppointments = appointments
    .filter(a => new Date(a.startAt) > now && a.status === 'pending')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 3)

  // Today's appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const todayAppointments = appointments
    .filter(a => {
      const start = new Date(a.startAt)
      return start >= today && start <= todayEnd && ['pending', 'confirmed'].includes(a.status)
    })
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

  // Recent appointments (last 5 completed/confirmed)
  const recentAppointments = appointments
    .filter(a => ['confirmed', 'completed'].includes(a.status))
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))
    .slice(0, 5)

  const stats = [
    {
      label: 'Total patients',
      value: uniquePatients,
      icon: Users,
    },
    {
      label: "Today's appointments",
      value: todayAppointments.length,
      icon: Calendar,
    },
    {
      label: 'Upcoming',
      value: upcomingAppointments.length,
      icon: Clock,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            Welcome back, Dr. {user?.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your schedule, patients and respond to consultations.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Top row: stats + quick actions */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Stats */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="rounded-xl bg-white border border-slate-100 px-4 py-4 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-xl font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick actions */}
{/* Quick actions */}
<div className="space-y-3">
  <Link
    to="/doctor/appointments"
    className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-white"
  >
    <div>
      <p className="text-sm font-medium">Manage appointments</p>
      <p className="text-xs text-blue-100">
        View & update patient appointments.
      </p>
    </div>
    <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
      <Calendar className="h-5 w-5" />
    </div>
  </Link>
  <Link
    to="/doctor/availability"
    className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-4 py-3"
  >
    <div>
      <p className="text-sm font-medium text-slate-900">
        Manage schedule
      </p>
      <p className="text-xs text-slate-500">
        Set your availability slots.
      </p>
    </div>
    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
      <Clock className="h-5 w-5 text-blue-600" />
    </div>
  </Link>
</div>

        </div>

        {/* Middle row: Today's appointments + Upcoming */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's appointments */}
          <div className="rounded-xl bg-white border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Today's appointments
              </h2>
              {todayAppointments.length > 3 && (
                <Link
                  to="/appointments"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              )}
            </div>

            {todayAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No appointments scheduled for today.
              </p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt._id}
                    className="rounded-lg border border-slate-100 px-4 py-3 flex flex-col gap-1"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {apt.patient?.name || 'Unknown patient'}
                    </p>
                    <p className="text-xs text-slate-500">{apt.reason || 'Consultation'}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(apt.startAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        apt.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming appointments */}
          <div className="rounded-xl bg-white border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Upcoming appointments
              </h2>
              <Link
                to="/appointments"
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="rounded-lg border border-slate-100 px-4 py-3 flex flex-col gap-1"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {apt.patient?.name || 'Unknown patient'}
                    </p>
                    <p className="text-xs text-slate-500">{apt.reason || 'Consultation'}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(apt.startAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(apt.startAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent appointments/patients */}
        <div className="rounded-xl bg-white border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Recent patients
            </h2>
            <Link
              to="/patients"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View all patients
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No recent appointments yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {apt.patient?.name || 'Unknown patient'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {apt.reason || 'General consultation'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <span>
                      {new Date(apt.startAt).toLocaleDateString()} •{' '}
                      {new Date(apt.startAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${
                      apt.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
