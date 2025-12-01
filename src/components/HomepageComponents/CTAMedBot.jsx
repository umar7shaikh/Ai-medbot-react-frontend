import React from 'react'
import roboImage from '../../assets/robo.webp'

const CTAMedBot = ({ onGetStarted }) => {
  return (
    <section className="w-full bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="rounded-3xl bg-white/80 border border-slate-100 shadow-sm shadow-sky-50 px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row items-center gap-8">
          {/* Robo illustration */}
          <div className="flex-shrink-0">
            <img
              src={roboImage}
              alt="MedBot assistant"
              className="h-40 w-auto sm:h-48 md:h-56 object-contain drop-shadow-md"
            />
          </div>

          {/* Text + CTA */}
          <div className="text-center md:text-left flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
              Get started in minutes
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900">
              Ready to try MedBot?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl md:max-w-none">
              Create your MedBot space, connect your care team, and start
              receiving personalised recommendations, reminders, and guidance for your health.
            </p>

            <div className="mt-6 flex md:justify-start justify-center">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center justify-center rounded-full bg-sky-600 px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-sky-700 transition"
              >
                Get started for free
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTAMedBot
