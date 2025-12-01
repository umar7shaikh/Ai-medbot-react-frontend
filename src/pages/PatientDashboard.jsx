import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  Clock,
  Pill,
  MessageSquare,
  Stethoscope,
  AlertCircle,
} from 'lucide-react'
import api from '../services/api'

const PatientDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState([])
  const [medications, setMedications] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        setLoading(true)

        const [apptRes, medRes] = await Promise.all([
          api.get('/appointments/my'),
          api.get('/medications/my'),
        ])

        setAppointments(apptRes.data || [])
        setMedications(medRes.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const now = new Date()

  const upcomingAppointments = appointments
    .filter(a => new Date(a.startAt) > now && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 3)

  const recentAppointments = appointments
    .slice()
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))
    .slice(0, 5)

  const activeMeds = medications.filter(m => m.status === 'active').slice(0, 4)

  const stats = [
    {
      label: 'Total appointments',
      value: appointments.length,
      icon: Calendar,
    },
    {
      label: 'Upcoming',
      value: upcomingAppointments.length,
      icon: Clock,
    },
    {
      label: 'Active medications',
      value: activeMeds.length,
      icon: Pill,
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
            Hi {user?.name}, take care of your health
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View your upcoming appointments, medications and talk to MedBot.
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
          <div className="space-y-3">
            <Link
              to="/chat"
              className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-white"
            >
              <div>
                <p className="text-sm font-medium">Talk to MedBot</p>
                <p className="text-xs text-blue-100">
                  Ask health questions anytime.
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
            </Link>
            <Link
              to="/appointments"
              className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Book appointment
                </p>
                <p className="text-xs text-slate-500">
                  Find a doctor and choose a time.
                </p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
            </Link>
          </div>
        </div>

        {/* Middle row: Upcoming appointments + Medications */}
        <div className="grid gap-6 lg:grid-cols-2">
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
                You have no upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="rounded-lg border border-slate-100 px-4 py-3 flex flex-col gap-1"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      Dr. {apt.doctor?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {apt.doctor?.specialization || 'General physician'}
                    </p>
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

          {/* Active medications */}
          <div className="rounded-xl bg-white border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">
                Active medications
              </h2>
              <Link
                to="/medications"
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {activeMeds.length === 0 ? (
              <p className="text-sm text-slate-500">
                You have no active medications.
              </p>
            ) : (
              <div className="space-y-3">
                {activeMeds.map((med) => (
                  <div
                    key={med._id}
                    className="rounded-lg border border-slate-100 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {med.drugName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {med.dosage} • {med.frequencyPerDay} times/day
                    </p>
                    {med.timesOfDay?.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        Times:{' '}
                        {med.timesOfDay
                          .map(t =>
                            t.length === 5 ? t : t.substring(0, 5)
                          )
                          .join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent appointments list */}
        <div className="rounded-xl bg-white border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Recent appointments
            </h2>
            <Link
              to="/appointments"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Manage appointments
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No appointment history yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Dr. {apt.doctor?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {apt.reason || 'General consultation'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <span>
                      {new Date(apt.startAt).toLocaleDateString()} •{' '}
                      {new Date(apt.startAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="capitalize text-slate-500">
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

export default PatientDashboard
