import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const DoctorAppointmentsPage = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // status update state
  const [updatingId, setUpdatingId] = useState(null)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/appointments/doctor')
      setAppointments(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      setUpdatingId(appointmentId)
      setUpdateError('')
      await api.patch(`/appointments/${appointmentId}/status`, { status })
      
      // optimistic update
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status }
            : apt
        )
      )
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const upcoming = appointments
    .filter(a => new Date(a.startAt) > new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

  const past = appointments
    .filter(a => new Date(a.startAt) <= new Date())
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt))

  const formatDate = iso =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const formatTime = iso =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const statusBadge = status => {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'pending':
        return `${base} bg-amber-50 text-amber-700`
      case 'confirmed':
        return `${base} bg-emerald-50 text-emerald-700`
      case 'cancelled':
        return `${base} bg-rose-50 text-rose-700`
      case 'completed':
        return `${base} bg-slate-100 text-slate-700`
      default:
        return `${base} bg-slate-100 text-slate-700`
    }
  }

  const getStatusActions = (appointment) => {
    const startTime = new Date(appointment.startAt)
    const now = new Date()
    const diffHours = (startTime - now) / (1000 * 60 * 60)

    if (appointment.status === 'cancelled') return []

    if (appointment.status === 'pending') {
      return [
        {
          label: 'Confirm',
          status: 'confirmed',
          icon: CheckCircle,
          color: 'bg-emerald-600 hover:bg-emerald-700'
        },
        {
          label: 'Cancel',
          status: 'cancelled',
          icon: XCircle,
          color: 'bg-rose-600 hover:bg-rose-700'
        }
      ]
    }

    if (appointment.status === 'confirmed' && diffHours > 0) {
      return [
        {
          label: 'Mark Complete',
          status: 'completed',
          icon: CheckCircle,
          color: 'bg-emerald-600 hover:bg-emerald-700'
        },
        {
          label: 'Cancel',
          status: 'cancelled',
          icon: XCircle,
          color: 'bg-rose-600 hover:bg-rose-700'
        }
      ]
    }

    return []
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Appointments
          </h1>
          <p className="text-sm text-slate-600">
            Manage your patient appointments and update their status.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {updateError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{updateError}</p>
          </div>
        )}

        {/* upcoming */}
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Upcoming appointments
          </h2>

          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">
              No upcoming appointments scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => (
                <div
                  key={a._id}
                  className="rounded-lg border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {a.patient?.name || 'Unknown patient'}
                        </p>
                        <p className="text-xs text-slate-500">{a.patient?.email}</p>
                      </div>
                    </div>
                    {a.reason && (
                      <p className="text-sm text-slate-600 pl-12">
                        Reason: {a.reason}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pl-12">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(a.startAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(a.startAt)}
                        {a.durationMinutes ? ` • ${a.durationMinutes} min` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 capitalize">
                        {a.locationType === 'online' ? (
                          <Video className="h-3.5 w-3.5" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5" />
                        )}
                        {a.locationType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1">
                    <span className={statusBadge(a.status)}>{a.status}</span>
                    <div className="flex gap-1 sm:flex-col">
                      {getStatusActions(a).map((action) => {
                        const Icon = action.icon
                        return (
                          <button
                            key={action.status}
                            onClick={() => handleStatusUpdate(a._id, action.status)}
                            disabled={updatingId === a._id}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg ${action.color} text-white disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center`}
                          >
                            {updatingId === a._id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Icon className="h-3 w-3" />
                            )}
                            <span>{action.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* past */}
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Past appointments
          </h2>

          {past.length === 0 ? (
            <p className="text-sm text-slate-500">
              No past appointments yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {past.slice(0, 20).map(a => (
                <div
                  key={a._id}
                  className="rounded-lg border border-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900">
                        {a.patient?.name || 'Unknown patient'}
                      </p>
                      <span className={statusBadge(a.status)}>{a.status}</span>
                    </div>
                    {a.reason && (
                      <p className="text-xs text-slate-600 ml-6">
                        {a.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(a.startAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(a.startAt)}
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

export default DoctorAppointmentsPage
