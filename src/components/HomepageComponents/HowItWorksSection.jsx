import React, { useState } from 'react'
import { motion } from 'framer-motion'

const HowItWorksSection = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Create your MedBot space',
      description:
        'Sign up in a few seconds and choose whether you are using MedBot as an individual or as a clinician. The workspace adapts to your role.',
      mobile: (
        <div className="relative flex justify-center">
          {/* Phone body */}
          <div className="relative h-[520px] w-[260px] rounded-3xl border-[3px] border-black bg-white overflow-hidden shadow-[10px_10px_25px_rgba(15,23,42,0.25)]">
            {/* Punch-hole camera */}
            <span className="absolute left-1/2 -translate-x-1/2 top-2 bg-black w-10 h-4 rounded-full" />
            {/* Screen content */}
            <div className="flex flex-col h-full px-5 pt-10 pb-8">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Welcome to MedBot
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Create your space
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Choose whether you are using MedBot as an individual or as a clinician. We adapt the workspace to your role.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Individual
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Personal visits, meds, and MedBot chat.
                    </p>
                  </div>
                  <span className="inline-flex h-6 px-2 items-center rounded-full bg-sky-100 text-[11px] font-medium text-sky-700">
                    Selected
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50/70 rounded-xl px-3 py-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Clinician
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Schedules, panels, and shared plans.
                    </p>
                  </div>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300" />
                </div>
              </div>
            </div>
          </div>
          {/* Slim side buttons outside border */}
          <span className="absolute -right-1 top-28 h-8 w-[3px] rounded-full bg-black" />
          <span className="absolute -right-1 top-44 h-16 w-[3px] rounded-full bg-black" />
        </div>
      ),
    },
    {
      title: 'Set up visits & plans',
      description:
        'Individuals book appointments and add medications. Clinicians configure availability, manage visits and create structured prescriptions.',
      mobile: (
        <div className="relative flex justify-center">
          {/* Phone body */}
          <div className="relative h-[520px] w-[260px] rounded-3xl border-[3px] border-black bg-white overflow-hidden shadow-[10px_10px_25px_rgba(15,23,42,0.25)]">
            {/* Punch-hole camera */}
            <span className="absolute left-1/2 -translate-x-1/2 top-2 bg-black w-10 h-4 rounded-full" />
            {/* Screen content */}
            <div className="flex flex-col h-full px-5 pt-10 pb-8">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Today&apos;s plan
              </p>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Visits &amp; medications
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-semibold text-slate-900">
                    Video visit · 10:30 AM
                  </p>
                  <p className="text-[11px] text-slate-500">
                    With your clinician · 30 min
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Morning medication
                    </p>
                    <p className="text-[11px] text-slate-500">
                      2 tablets · after breakfast
                    </p>
                  </div>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-700">
                    ✓
                  </span>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 px-3 py-3 text-[11px] text-slate-500">
                  Add another visit or medication
                </div>
              </div>
            </div>
          </div>
          {/* Slim side buttons outside border */}
          <span className="absolute -right-1 top-28 h-8 w-[3px] rounded-full bg-black" />
          <span className="absolute -right-1 top-44 h-16 w-[3px] rounded-full bg-black" />
        </div>
      ),
    },
    {
      title: 'Use MedBot every day',
      description:
        'Ask health questions, get suggestions, and keep your care plan on track with MedBot and your clinicians.',
      mobile: (
        <div className="relative flex justify-center">
          {/* Phone body */}
          <div className="relative h-[520px] w-[260px] rounded-3xl border-[3px] border-black bg-white overflow-hidden shadow-[10px_10px_25px_rgba(15,23,42,0.25)]">
            {/* Punch-hole camera */}
            <span className="absolute left-1/2 -translate-x-1/2 top-2 bg-black w-10 h-4 rounded-full" />
            {/* Screen content */}
            <div className="flex flex-col h-full px-5 pt-10 pb-20">
              <div className="mb-4">
                <p className="text-[11px] text-sky-500 uppercase tracking-wide">
                  MedBot chat
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Everyday guidance
                </h3>
              </div>
              <div className="space-y-3 text-[11px] flex-1 overflow-hidden">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-900 max-w-[80%]">
                  I have a cough and mild fever. What should I do?
                </div>
                <div className="ml-auto rounded-2xl bg-sky-500 px-4 py-3 text-white max-w-[80%]">
                  MedBot checks your symptoms and offers likely causes, home care tips, and when to contact a clinician.
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-slate-900 max-w-[80%]">
                  Can you help me follow my treatment plan?
                </div>
                <div className="ml-auto rounded-2xl bg-sky-500 px-4 py-3 text-white max-w-[80%]">
                  You get personalised reminders, risk alerts, and follow‑up recommendations based on your plan.
                </div>
              </div>
              {/* Input bar INSIDE phone */}
              <div className="mt-3 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[11px] shadow-sm">
                <div className="flex-1 text-slate-400 truncate">
                  Ask MedBot about symptoms, meds, or next steps…
                </div>
                <div className="h-6 w-6 rounded-full bg-sky-500 flex items-center justify-center text-[10px] text-white">
                  →
                </div>
              </div>
            </div>
          </div>
          {/* Slim side buttons outside border */}
          <span className="absolute -right-1 top-28 h-8 w-[3px] rounded-full bg-black" />
          <span className="absolute -right-1 top-44 h-16 w-[3px] rounded-full bg-black" />
        </div>
      ),
    },
  ]

  return (
    <section className="w-full bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-left mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
            How MedBot fits in
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900"
          >
            Three simple steps to get value from day one.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl"
          >
            MedBot keeps visits, medications, and everyday questions in one place so both people and clinicians stay in sync.
          </motion.p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: clickable steps */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const isActive = currentStep === index
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`w-full text-left transition-all duration-300 rounded-2xl border p-4 sm:p-5 ${
                    isActive
                      ? 'bg-white border-sky-400 shadow-md shadow-sky-100'
                      : 'bg-white/80 border-slate-200 hover:border-sky-200 hover:bg-white'
                  }`}
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1 : 0.97,
                      opacity: isActive ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-semibold text-sky-500">
                      Step {index + 1}
                    </p>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </button>
              )
            })}
          </div>

          {/* Right: active mobile mockup */}
          <div className="flex items-center justify-center h-[520px]">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.94 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center"
            >
              {steps[currentStep].mobile}
            </motion.div>
          </div>
        </div>

        {/* Click progress indicator */}
        <div className="flex justify-center gap-2 mt-10">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === index ? 'w-8 bg-sky-600' : 'w-2 bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
