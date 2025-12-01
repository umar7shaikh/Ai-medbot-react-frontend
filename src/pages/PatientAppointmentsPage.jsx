import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Calendar,
  Clock,
  Pill,
  Stethoscope,
  MapPin,
  Video,
  AlertCircle,
  Loader2,
} from 'lucide-react'

const PatientAppointmentsPage = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // booking state
  const [isBooking, setIsBooking] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [locationType, setLocationType] = useState('clinic')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')

  useEffect(() => {
    loadAppointments()
    loadDoctors()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const res = await api.get('/appointments/my')
      setAppointments(res.data || [])
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Failed to load appointments')
      setLoading(false)
    }
  }

  // you might already have a doctors list API; for now, reuse /api/appointments/doctor-side is not ideal
  // so assume there is /api/users?role=doctor OR you can hardcode/test with a simple call
  const loadDoctors = async () => {
    try {
      // adjust this endpoint if you have a dedicated one for listing doctors
      const res = await api.get('/doctors') // if you don't have this, temporarily skip doctor dropdown
      setDoctors(res.data || [])
    } catch (err) {
      console.error('Load doctors error (adjust endpoint as needed):', err)
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

  const openBooking = () => {
    setIsBooking(true)
    setBookingError('')
    setBookingSuccess('')
    setSelectedDoctorId('')
    setSelectedDate('')
    setSlots([])
    setSelectedSlot(null)
    setReason('')
    setLocationType('clinic')
  }

  const fetchSlots = async () => {
    if (!selectedDoctorId || !selectedDate) return
    try {
      setLoadingSlots(true)
      setSlots([])
      setSelectedSlot(null)
      const res = await api.get(
        `/doctors/${selectedDoctorId}/availability`,
        { params: { date: selectedDate } }
      )
      setSlots(res.data.slots || [])
      setLoadingSlots(false)
    } catch (err) {
      setLoadingSlots(false)
      setBookingError(err.message || 'Failed to load slots')
    }
  }

  const handleBook = async () => {
    if (!selectedDoctorId || !selectedSlot) {
      setBookingError('Please select doctor and time slot')
      return
    }
    setBookingLoading(true)
    setBookingError('')
    setBookingSuccess('')
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctorId,
        startAt: selectedSlot.startAt,
        reason,
        locationType,
      })
      setBookingSuccess('Appointment requested successfully')
      setBookingLoading(false)
      await loadAppointments()
    } catch (err) {
      setBookingLoading(false)
      setBookingError(
        err.response?.data?.message || err.message || 'Booking failed'
      )
    }
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Appointments
            </h1>
            <p className="text-sm text-slate-600">
              View and book appointments with doctors.
            </p>
          </div>
          <button
            onClick={openBooking}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Calendar className="h-4 w-4" />
            Book new appointment
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* upcoming */}
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Upcoming appointments
            </h2>
            <p className="text-xs text-slate-500">
              Maximum 3 active appointments per day.
            </p>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">
              You have no upcoming appointments. Click “Book new appointment”
              to schedule one.
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => (
                <div
                  key={a._id}
                  className="rounded-lg border border-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-slate-900">
                        Dr. {a.doctor?.name || 'Unknown'}
                      </p>
                      <span className={statusBadge(a.status)}>{a.status}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {a.doctor?.specialization || 'General physician'}
                    </p>
                    {a.reason && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        Reason: {a.reason}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(a.startAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(a.startAt)}
                        {a.durationMinutes
                          ? ` • ${a.durationMinutes} min`
                          : ''}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* past */}
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Past appointments
            </h2>
          </div>

          {past.length === 0 ? (
            <p className="text-sm text-slate-500">
              You don’t have any past appointments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {past.map(a => (
                <div
                  key={a._id}
                  className="rounded-lg border border-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">
                      Dr. {a.doctor?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {a.doctor?.specialization || 'General physician'}
                    </p>
                    {a.reason && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        Reason: {a.reason}
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
                    <span className={statusBadge(a.status)}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* booking drawer */}
      {isBooking && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Book appointment
              </h2>
              <button
                onClick={() => setIsBooking(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            {bookingError && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>{bookingError}</p>
              </div>
            )}

            {bookingSuccess && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>{bookingSuccess}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* doctor */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => {
                    setSelectedDoctorId(e.target.value)
                    setSlots([])
                    setSelectedSlot(null)
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name} {d.specialization ? `– ${d.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value)
                    setSlots([])
                    setSelectedSlot(null)
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* load slots */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={fetchSlots}
                  disabled={!selectedDoctorId || !selectedDate || loadingSlots}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSlots && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Show available slots</span>
                </button>
              </div>

              {/* slots */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Time slot
                </label>
                {slots.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No slots loaded yet. Choose doctor and date, then click
                    “Show available slots”.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {slots.map(slot => (
                      <button
                        key={slot.startAt}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border px-2 py-1.5 text-xs ${
                          selectedSlot?.startAt === slot.startAt
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {new Date(slot.startAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* location type */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Visit type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationType('clinic')}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${
                      locationType === 'clinic'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Clinic
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('online')}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${
                      locationType === 'online'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    Online
                  </button>
                </div>
              </div>

              {/* reason */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Reason (optional)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Briefly describe your symptoms or reason for visit."
                />
              </div>

              {/* actions */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500 max-w-xs">
                  You can cancel up to 2 hours before the appointment time.
                </p>
                <button
                  type="button"
                  disabled={bookingLoading}
                  onClick={handleBook}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Confirm booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientAppointmentsPage

