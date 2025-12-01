// src/pages/DoctorMedicationsPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import {
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  Pill,
  Plus,
  X,
} from 'lucide-react'

const DoctorMedicationsPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const [medsLoading, setMedsLoading] = useState(false)
  const [medications, setMedications] = useState([])
  const [medError, setMedError] = useState('')

  // create / update
  const [creating, setCreating] = useState(false)
  const [creatingError, setCreatingError] = useState('')
  const [creatingLoading, setCreatingLoading] = useState(false)

  const [drugName, setDrugName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequencyPerDay, setFrequencyPerDay] = useState(1)
  const [timesOfDay, setTimesOfDay] = useState([]) // ['08:00', '20:00']
  const [route, setRoute] = useState('oral')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [instructions, setInstructions] = useState('')

  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setLoading(true)
        setError('')
        const apptRes = await api.get('/appointments/doctor')
        const appts = apptRes.data || []
        setAppointments(appts)

        const map = new Map()
        appts.forEach(a => {
          if (a.patient?._id && !map.has(a.patient._id)) {
            map.set(a.patient._id, {
              _id: a.patient._id,
              name: a.patient.name,
              email: a.patient.email,
            })
          }
        })
        const pts = Array.from(map.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        )
        setPatients(pts)
        if (pts.length > 0) setSelectedPatientId(pts[0]._id)
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadDoctorData()
  }, [])

  useEffect(() => {
    if (!selectedPatientId) return
    const loadMeds = async () => {
      try {
        setMedsLoading(true)
        setMedError('')
        const res = await api.get(`/medications/patient/${selectedPatientId}`)
        setMedications(res.data || [])
      } catch (err) {
        setMedError(err.message || 'Failed to load medications')
      } finally {
        setMedsLoading(false)
      }
    }
    loadMeds()
  }, [selectedPatientId])

  const activeMeds = useMemo(
    () => medications.filter(m => m.status === 'active'),
    [medications],
  )

  const pastMeds = useMemo(
    () =>
      medications.filter(m => m.status === 'completed' || m.status === 'stopped'),
    [medications],
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

  const toggleTimeChip = value => {
    setTimesOfDay(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value],
    )
  }

  const presetTimes = [
    { label: 'Morning', value: '08:00' },
    { label: 'Afternoon', value: '14:00' },
    { label: 'Evening', value: '20:00' },
  ]

  const openCreate = () => {
    setCreating(true)
    setCreatingError('')
    setDrugName('')
    setDosage('')
    setFrequencyPerDay(1)
    setTimesOfDay(['08:00'])
    setRoute('oral')
    setStartDate(new Date().toISOString().slice(0, 10))
    setEndDate('')
    setInstructions('')
  }

  const handleCreate = async () => {
    if (!selectedPatientId) {
      setCreatingError('Select a patient first')
      return
    }
    if (!drugName || !dosage || !frequencyPerDay || timesOfDay.length === 0 || !startDate) {
      setCreatingError('Please fill all required fields')
      return
    }
    try {
      setCreatingLoading(true)
      setCreatingError('')
      await api.post('/medications', {
        patientId: selectedPatientId,
        drugName,
        dosage,
        frequencyPerDay: Number(frequencyPerDay),
        timesOfDay,
        route,
        startDate,
        endDate: endDate || undefined,
        instructions,
      })
      setCreating(false)
      setCreatingLoading(false)

      const res = await api.get(`/medications/patient/${selectedPatientId}`)
      setMedications(res.data || [])
    } catch (err) {
      setCreatingLoading(false)
      setCreatingError(
        err.response?.data?.message || err.message || 'Failed to create medication',
      )
    }
  }

  const updateStatus = async (id, status) => {
    try {
      setStatusUpdatingId(id)
      setStatusError('')
      await api.patch(`/medications/${id}/status`, { status })
      setMedications(prev =>
        prev.map(m => (m._id === id ? { ...m, status } : m)),
      )
    } catch (err) {
      setStatusError(
        err.response?.data?.message || err.message || 'Failed to update status',
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Medications
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              View and manage prescriptions for your patients.
            </p>
          </div>
          <button
            onClick={openCreate}
            disabled={!selectedPatientId}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            New prescription
          </button>
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

        {/* patient selector */}
        <div className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Patient</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose a patient from your recent appointments.
            </p>
          </div>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="w-full sm:w-72 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select patient</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} {p.email ? `– ${p.email}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* content */}
        {!selectedPatientId ? (
          <p className="text-sm text-slate-500">
            Select a patient to view and manage medications.
          </p>
        ) : (
          <>
            {/* Active meds */}
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">
                  Active medications
                </h2>
              </div>

              {medsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading medications...
                </div>
              ) : medError ? (
                <p className="text-sm text-rose-600">{medError}</p>
              ) : activeMeds.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No active medications for this patient.
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
                              .map(t =>
                                t.length === 5 ? t : t.substring(0, 5),
                              )
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
                        </div>
                        {m.instructions && (
                          <p className="text-xs text-slate-600 ml-10 mt-1">
                            Note: {m.instructions}
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
                          {statusUpdatingId === m._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : null}
                          <span>Mark completed</span>
                        </button>
                        <button
                          type="button"
                          disabled={statusUpdatingId === m._id}
                          onClick={() => updateStatus(m._id, 'stopped')}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {statusUpdatingId === m._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : null}
                          <span>Stop</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">
                  Medication history
                </h2>
              </div>

              {medsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading medications...
                </div>
              ) : pastMeds.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No completed or stopped medications yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* create prescription drawer */}
      {creating && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                New prescription
              </h2>
              <button
                onClick={() => setCreating(false)}
                className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Close
              </button>
            </div>

            {creatingError && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>{creatingError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Drug name
                </label>
                <input
                  type="text"
                  value={drugName}
                  onChange={e => setDrugName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Dosage
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="e.g. 500 mg"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Times per day
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={frequencyPerDay}
                    onChange={e => setFrequencyPerDay(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Route
                  </label>
                  <select
                    value={route}
                    onChange={e => setRoute(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="oral">Oral</option>
                    <option value="injection">Injection</option>
                    <option value="topical">Topical</option>
                    <option value="inhalation">Inhalation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Times of day
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetTimes.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggleTimeChip(t.value)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] border ${
                        timesOfDay.includes(t.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {t.label}
                    </button>
                  ))}
                </div>
                {timesOfDay.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Selected: {timesOfDay.join(', ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    End date (optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Instructions (optional)
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="e.g. Take after food, avoid driving, etc."
                />
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  disabled={creatingLoading}
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Create prescription</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorMedicationsPage
