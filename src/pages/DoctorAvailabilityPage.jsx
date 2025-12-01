import React, { useEffect, useState } from 'react'
import api from '../services/api'
import {
  Calendar,
  Clock,
  Save,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'

const TIME_OPTIONS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00',
]

const DoctorAvailabilityPage = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [slotDuration, setSlotDuration] = useState(30)
  const [days, setDays] = useState([]) // [{ dayOfWeek, timeRanges:[{startTime,endTime}] }]
  const [selectedDay, setSelectedDay] = useState(1) // Monday by default

  const daysOfWeek = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
  ]

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await api.get('/doctors/me/availability')
        const data = res.data || {}
        setSlotDuration(data.slotDurationMinutes || 30)
        setDays(data.days || [])
      } catch (err) {
        setError(err.message || 'Failed to load availability')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getDayConfig = (dayOfWeek) =>
    days.find(d => d.dayOfWeek === dayOfWeek) || { dayOfWeek, timeRanges: [] }

  const setDayConfig = (dayOfWeek, timeRanges) => {
    setDays(prev => {
      const others = prev.filter(d => d.dayOfWeek !== dayOfWeek)
      if (!timeRanges.length) return others
      return [...others, { dayOfWeek, timeRanges }]
    })
  }

  const addRange = () => {
    const cfg = getDayConfig(selectedDay)
    const next = [...cfg.timeRanges, { startTime: '09:00', endTime: '09:30' }]
    setDayConfig(selectedDay, next)
  }

  const updateRange = (index, field, value) => {
    const cfg = getDayConfig(selectedDay)
    const next = cfg.timeRanges.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    )
    setDayConfig(selectedDay, next)
  }

  const removeRange = (index) => {
    const cfg = getDayConfig(selectedDay)
    const next = cfg.timeRanges.filter((_, i) => i !== index)
    setDayConfig(selectedDay, next)
  }

  const isValidRange = (r) => {
    if (!r.startTime || !r.endTime) return true
    const [sh, sm] = r.startTime.split(':').map(Number)
    const [eh, em] = r.endTime.split(':').map(Number)
    return eh * 60 + em > sh * 60 + sm
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await api.post('/doctors/me/availability', {
        slotDurationMinutes: slotDuration,
        days,
      })
      setSuccess('Schedule saved successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const selectedCfg = getDayConfig(selectedDay)

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Manage Availability
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Weekly recurring schedule. Patients book inside these slots.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save schedule
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* slot duration */}
        <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Slot duration</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Each appointment will be {slotDuration} minutes long.
            </p>
          </div>
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[15, 20, 25, 30, 45, 60].map(m => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
        </div>

        {/* day chips */}
        <div className="rounded-xl bg-white border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">
            Weekly pattern
          </p>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(d => {
              const cfg = getDayConfig(d.id)
              const active = d.id === selectedDay
              const has = cfg.timeRanges.length > 0
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDay(d.id)}
                  className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors
                    ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}
                  `}
                >
                  {d.name}{' '}
                  {has && (
                    <span className="text-[10px] opacity-80">
                      ({cfg.timeRanges.length})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* editor for selected day */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              {daysOfWeek.find(d => d.id === selectedDay)?.name} availability
            </p>
            <button
              type="button"
              onClick={addRange}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add time range
            </button>
          </div>

          {selectedCfg.timeRanges.length === 0 ? (
            <p className="text-sm text-slate-500">
              No availability for this day. Click “Add time range” to start.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedCfg.timeRanges.map((r, idx) => {
                const invalid = !isValidRange(r)
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[11px] text-slate-500 mb-1">
                          Start time
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <select
                            value={r.startTime}
                            onChange={e =>
                              updateRange(idx, 'startTime', e.target.value)
                            }
                            className="rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 mb-1">
                          End time
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <select
                            value={r.endTime}
                            onChange={e =>
                              updateRange(idx, 'endTime', e.target.value)
                            }
                            className="rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {invalid ? (
                        <p className="text-[11px] text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          End must be after start
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          {r.startTime} – {r.endTime}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => removeRange(idx)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 hover:text-rose-600 text-slate-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorAvailabilityPage
