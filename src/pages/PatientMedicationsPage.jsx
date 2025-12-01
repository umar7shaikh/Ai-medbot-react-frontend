// src/pages/PatientMedicationsPage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import api from '../services/api'
import {
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  Pill,
} from 'lucide-react'

const PatientMedicationsPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [medications, setMedications] = useState([])
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    const loadMeds = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/medications/my')
        setMedications(res.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load medications')
      } finally {
        setLoading(false)
      }
    }
    loadMeds()
  }, [])

  const activeMeds = useMemo(
    () => medications.filter(m => m.status === 'active'),
    [medications]
  )

  const pastMeds = useMemo(
    () => medications.filter(m => m.status === 'completed' || m.status === 'stopped'),
    [medications]
  )

  const statusBadge = status => {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'active':
        return `${base} bg-emerald-50 text-emerald-700`
      case 'completed':
        return `${base} bg-slate-100 text-slate-700`
      case 'stopped':
        return `${base} bg-rose-50 text-rose-700`
      default:
        return `${base} bg-slate-100 text-slate-700`
    }
  }

  const formatDate = iso =>
    iso
      ? new Date(iso).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '-'

  const updateStatus = async (id, status) => {
    try {
      setStatusUpdatingId(id)
      setStatusError('')
      await api.patch(`/medications/${id}/status`, { status })
      setMedications(prev =>
        prev.map(m => (m._id === id ? { ...m, status } : m))
      )
    } catch (err) {
      setStatusError(
        err.response?.data?.message || err.message || 'Failed to update medication'
      )
    } finally {
      setStatusUpdatingId(null)
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
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Medications
          </h1>
          <p className="text-sm text-slate-600">
            View your current prescriptions and past medications.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {statusError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{statusError}</p>
          </div>
        )}

        {/* Active meds */}
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Active medications
          </h2>

          {activeMeds.length === 0 ? (
            <p className="text-sm text-slate-500">
              You have no active medications right now.
            </p>
          ) : (
            <div className="space-y-3">
              {activeMeds.map(m => (
                <div
                  key={m._id}
                  className="rounded-lg border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Pill className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {m.drugName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {m.dosage} • {m.frequencyPerDay} times/day
                        </p>
                      </div>
                    </div>
                    {m.timesOfDay?.length > 0 && (
                      <p className="text-xs text-slate-500 ml-10">
                        Times:{' '}
                        {m.timesOfDay
                          .map(t => (t.length === 5 ? t : t.substring(0, 5)))
                          .join(', ')}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 ml-10 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(m.startDate)}{' '}
                        {m.endDate ? `→ ${formatDate(m.endDate)}` : ''}
                      </span>
                      <span className={statusBadge(m.status)}>
                        {m.status}
                      </span>
                      {m.doctor && (
                        <span>
                          Prescribed by Dr. {m.doctor.name}
                        </span>
                      )}
                    </div>
                    {m.instructions && (
                      <p className="text-xs text-slate-600 ml-10 mt-1">
                        Instructions: {m.instructions}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      disabled={statusUpdatingId === m._id}
                      onClick={() => updateStatus(m._id, 'completed')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusUpdatingId === m._id && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      <span>Mark completed</span>
                    </button>
                    <button
                      type="button"
                      disabled={statusUpdatingId === m._id}
                      onClick={() => updateStatus(m._id, 'stopped')}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusUpdatingId === m._id && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      <span>Stop taking</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="rounded-xl bg-white border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Medication history
          </h2>

          {pastMeds.length === 0 ? (
            <p className="text-sm text-slate-500">
              No past medications yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pastMeds.map(m => (
                <div
                  key={m._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-100 rounded-lg px-3 py-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">
                      {m.drugName} – {m.dosage}
                    </p>
                    <p className="text-xs text-slate-500">
                      {m.frequencyPerDay}×/day •{' '}
                      {m.timesOfDay
                        ?.map(t => (t.length === 5 ? t : t.substring(0, 5)))
                        .join(', ')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(m.startDate)}{' '}
                      {m.endDate ? `→ ${formatDate(m.endDate)}` : ''}
                    </span>
                    <span className={statusBadge(m.status)}>
                      {m.status}
                    </span>
                    {m.doctor && (
                      <span>Dr. {m.doctor.name}</span>
                    )}
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

export default PatientMedicationsPage
