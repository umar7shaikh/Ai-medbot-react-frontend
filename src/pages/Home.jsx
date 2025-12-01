// src/pages/Home.jsx
import React, { useState } from 'react'
import { MessageCircle, Calendar, Pill, ArrowRight } from 'lucide-react'
import LoginModal from '../components/commonComponents/LoginModal'
import RegisterModal from '../components/commonComponents/RegisterModal'
import heroImg from '../assets/hero.webp'
import FeatureSection from '../components/HomepageComponents/FeatureSection.jsx'
import HowItWorksSection from '../components/HomepageComponents/HowItWorksSection.jsx'
import CTAMedBot from '../components/HomepageComponents/CTAMedBot.jsx'

const Home = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background image only */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative px-6 lg:px-10">
          <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-12 lg:py-16">
            {/* top pill */}
            <div className="mb-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-1.5 text-[12px] font-medium tracking-wide text-slate-800 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                AI‑first health workspace for people &amp; clinicians
              </p>
            </div>

            {/* main row */}
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] items-center">
              {/* LEFT */}
              <div className="space-y-7 max-w-2xl">
                <h1 className="text-[3.2rem] sm:text-[3.6rem] lg:text-[4rem] leading-tight font-semibold tracking-tight">
                  <span className="block text-slate-900 drop-shadow-[0_1px_6px_rgba(255,255,255,0.95)]">
                    Revolutionizing
                  </span>
                  <span className="block">
                    <span className="text-slate-900 drop-shadow-[0_1px_6px_rgba(255,255,255,0.95)]">
                      Healthcare with{' '}
                    </span>
                    <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_1px_6px_rgba(255,255,255,0.95)]">
                      MedBot AI
                    </span>
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-900/90 drop-shadow-[0_1px_5px_rgba(255,255,255,0.9)] max-w-xl">
                  Turn scattered health apps into a single intelligent surface.
                  MedBot connects live conversations, visits and medications so
                  every step of care feels clear and coordinated.
                </p>

                {/* actions */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-sky-500 px-7 py-3 text-sm sm:text-base font-medium text-white shadow-md hover:bg-sky-400 transition"
                  >
                    Get started
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-7 py-3 text-sm sm:text-base font-medium text-slate-800 shadow-sm hover:bg-white transition"
                  >
                    Sign in
                  </button>
                </div>

                {/* quick tags */}
                <div className="flex flex-wrap gap-2 pt-4 text-[12px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3.5 py-1 text-slate-800 shadow-sm">
                    <MessageCircle className="h-4 w-4 text-sky-500" />
                    AI chat with image &amp; voice
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3.5 py-1 text-slate-800 shadow-sm">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    Smart visit scheduling
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3.5 py-1 text-slate-800 shadow-sm">
                    <Pill className="h-4 w-4 text-emerald-500" />
                    Guided medication routines
                  </span>
                </div>
              </div>

              {/* RIGHT – empty (hero image shows) */}
              <div className="hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <FeatureSection />
      <CTAMedBot onGetStarted={() => setRegisterModalOpen(true)} />
      

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false)
          setRegisterModalOpen(true)
        }}
      />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false)
          setLoginModalOpen(true)
        }}
      />
    </div>
  )
}

export default Home
