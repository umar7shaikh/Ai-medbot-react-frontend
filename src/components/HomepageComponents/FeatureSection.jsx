// src/components/HomepageComponents/FeatureSection.jsx
import React, { useState } from 'react'

const FeatureSection = () => {
  const [mode, setMode] = useState('individual')
  const isIndividual = mode === 'individual'

  const individualPoints = [
    'Chat with MedBot about symptoms, reports or medications in natural language — anytime, on any device.',
    'See all upcoming visits on a single timeline so you never forget what is next.',
    'Stay on top of medications with clear doses, times of day and start–end dates.',
    'Keep conversations, appointments and prescriptions linked to one shared record.',
  ]

  const clinicianPoints = [
    'Start each day with a clear view of booked visits, new requests and follow‑ups.',
    'Set weekly availability once; MedBot generates clash‑free slots for your clients.',
    'Prescribe and adjust medications in a structured way, with full history at a glance.',
    'Spend less time on admin and more time on care, with everything in one workspace.',
  ]

  const points = isIndividual ? individualPoints : clinicianPoints

  return (
    <section className="relative overflow-hidden bg-white text-slate-900">
      {/* large blue circles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-32 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-sky-300 to-blue-500 opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-[-6rem] h-[16rem] w-[16rem] rounded-full bg-gradient-to-tr from-blue-500 to-sky-300 opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-[-6rem] h-[11rem] w-[11rem] rounded-full bg-gradient-to-tr from-sky-300 to-blue-400 opacity-60"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[70vh] lg:min-h-[80vh] flex items-center py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] items-center w-full">
            {/* LEFT: title + toggle */}
            <div className="space-y-7">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                  MedBot workspace views
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-semibold text-slate-900">
                  Designed around how people and clinicians actually work.
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-md">
                  Switch the view to see how the same MedBot surface supports
                  everyday health tasks or a full clinic day.
                </p>
              </div>

              {/* vertical toggle */}
              <div className="space-y-3 mt-2">
                <button
                  type="button"
                  onClick={() => setMode('individual')}
                  className={`flex items-center justify-between w-full sm:w-72 rounded-full px-5 py-2.5 text-sm font-medium border transition
                    ${
                      isIndividual
                        ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.55)]'
                        : 'bg-white/80 text-slate-700 border-slate-300 hover:border-sky-400'
                    }`}
                >
                  <span>For individuals</span>
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      isIndividual
                        ? 'border-white bg-white/90'
                        : 'border-slate-400 bg-transparent'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setMode('clinician')}
                  className={`flex items-center justify-between w-full sm:w-72 rounded-full px-5 py-2.5 text-sm font-medium border transition
                    ${
                      !isIndividual
                        ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.55)]'
                        : 'bg-white/80 text-slate-700 border-slate-300 hover:border-sky-400'
                    }`}
                >
                  <span>For clinicians</span>
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      !isIndividual
                        ? 'border-white bg-white/90'
                        : 'border-slate-400 bg-transparent'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* RIGHT: full‑width bullet grid, vertically centered with left via flex */}
            <div className="relative">
              <div className="grid gap-y-7 gap-x-12 sm:grid-cols-2 text-sm sm:text-base">
                {points.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-sky-400 bg-white/80">
                      <div className="h-2 w-2 rounded-full bg-sky-500" />
                    </div>
                    <p className="text-slate-900 leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureSection
