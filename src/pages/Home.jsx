import { lazy, Suspense, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CountdownTimer from '../components/CountdownTimer'
import SpeakerCard from '../components/SpeakerCard'
import GulfWarBanner from '../components/GulfWarBanner'
import Ticker from '../components/Ticker'
import { EVENT_LOGO_URL, EVENT_SHORT_TITLE } from '../config/branding'
import { useAppData } from '../context/useAppData'
import { SUB_EVENTS } from '../config/subEvents'

const RocketEffect = lazy(() => import('../components/RocketEffect'))

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: 'easeOut' },
  }),
}

function Home() {
  const navigate = useNavigate()
  const { speakers, settings, organisers } = useAppData()

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll('.reveal'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        visibleEntries.forEach((entry, index) => {
          entry.target.style.transitionDelay = `${index * 100}ms`
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    revealElements.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative pb-8">
      <Suspense fallback={null}>
        <RocketEffect />
      </Suspense>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-8 pt-10 sm:pb-10 sm:pt-16">
        <Motion.div
          className="overflow-hidden rounded-2xl border border-primary/40 p-5 sm:p-10 lg:p-14"
          style={{
            background:
              'radial-gradient(circle at 70% 40%, rgba(160,16,16,0.30), transparent 42%), radial-gradient(circle at 20% 70%, rgba(80,74,34,0.32), transparent 48%), rgba(42,37,24,0.56)',
          }}
        >
          <Motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-primary sm:text-xs sm:tracking-[0.25em]"
          >
            <img alt="Kalam Conclave logo" className="h-9 w-auto rounded-sm object-contain" src={EVENT_LOGO_URL} />
            <span>{EVENT_SHORT_TITLE} — Theme 2025</span>
          </Motion.div>

          <Motion.h1
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-4 font-display text-[clamp(2.4rem,11vw,8rem)] leading-[0.84]"
          >
            <span className="text-sand">Science In the</span>
            <span className="block text-accent">Shadow of War</span>
          </Motion.h1>

          <Motion.p
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-4 max-w-3xl font-subtitle text-base text-sand/92 sm:text-xl"
          >
            When conflict reshapes civilisation, science becomes both weapon and lifeline. Explore
            how the ongoing Gulf War is redefining research, medicine, and innovation.
          </Motion.p>

          <Motion.div
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-6 space-y-1.5 font-mono text-sm text-sand/80"
          >
            <p>📅 {settings.event_date_label} | {settings.event_time_label}</p>
            <p>📍 {settings.event_venue}</p>
          </Motion.div>

          <Motion.div custom={0.5} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 max-w-xl">
            <CountdownTimer />
          </Motion.div>

          <Motion.button
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 w-full rounded border border-accent bg-accent px-7 py-3 font-semibold text-bg transition hover:brightness-110 sm:w-auto"
            onClick={() => navigate('/register')}
            type="button"
          >
            Register Now →
          </Motion.button>
        </Motion.div>
      </section>

      <Ticker />
      <GulfWarBanner />

      <section id="about" className="reveal relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-display text-4xl leading-none text-accent sm:text-5xl">About the Conclave</h2>
          <div className="mt-2 h-px w-20 bg-primary/70" />
        </div>
        <div className="topic-card p-4 sm:p-7">
          <p className="leading-relaxed text-sand/90">
            Kalam Conclave 2.0 examines how modern science operates under the pressure of active
            conflict. With the ongoing Gulf War as the featured lens, this edition focuses on
            ethical innovation, rapid-response medicine, and resilience engineering.
          </p>
          <p className="mt-4 leading-relaxed text-sand/86">
            Inspired by Dr. A.P.J. Abdul Kalam's vision, the conclave brings together students and
            experts to decode science where stakes are highest.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: '🛰️', tag: 'Intelligence', title: 'Battlefield Data', desc: 'Satellite and sensing systems' },
              { icon: '🩺', tag: 'Medicine', title: 'Trauma Care', desc: 'Crisis surgery and field response' },
              { icon: '⚖️', tag: 'Ethics', title: 'Policy & Law', desc: 'Weapons, AI, and accountability' },
            ].map((item) => (
              <article key={item.title} className="topic-card p-4">
                <span className="text-lg">{item.icon}</span>
                <p className="mt-2 font-mono text-[0.63rem] uppercase tracking-[0.2em] text-sand/72">
                  {item.tag}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-none text-accent sm:text-3xl">{item.title}</h3>
                <p className="mt-2 text-xs italic text-sand/86">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Events: Choose Your Battleground ── */}
      <section id="events" className="reveal relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-display text-4xl leading-none text-sand sm:text-5xl">
            Choose Your <span className="text-accent">Battleground</span>
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-sand/55">
            4 events — pick yours and register
          </p>
          <div className="mt-2 h-px w-20 bg-primary/70" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUB_EVENTS.map((ev) => (
            <article
              key={ev.id}
              className="topic-card flex flex-col p-5 transition-all"
              style={{ borderColor: `${ev.color}33` }}
            >
              <span className="text-3xl">{ev.icon}</span>
              <h3
                className="mt-3 font-display text-2xl leading-none sm:text-3xl"
                style={{ color: ev.color }}
              >
                {ev.name}
              </h3>
              <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-sand/55">
                {ev.fullName}
              </p>
              <p className="mt-2 flex-1 text-xs italic text-sand/80">{ev.tagline}</p>
              <p className="mt-2 font-mono text-[0.6rem] text-sand/45">📍 {ev.venue}</p>
              <button
                className="mt-4 w-full rounded px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                onClick={() => navigate(`/register/${ev.id}`)}
                style={{ background: `linear-gradient(135deg, ${ev.gradientFrom}, ${ev.gradientTo})` }}
                type="button"
              >
                Register →
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="guests" className="reveal relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-display text-4xl leading-none text-accent sm:text-5xl">Featured Guests</h2>
          <div className="mt-2 h-px w-20 bg-primary/70" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {speakers.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      </section>

      <section id="organisers" className="reveal relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-display text-4xl leading-none text-accent sm:text-5xl">Organisers</h2>
          <div className="mt-2 h-px w-20 bg-primary/70" />
        </div>
        {organisers.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {organisers.map((org) => (
              <article key={org.id} className="topic-card p-5">
                <div className="flex items-center gap-3">
                  {org.image ? (
                    <img alt={org.name} className="h-14 w-14 rounded-full border border-sand/25 object-cover" src={org.image} />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface/70 text-2xl">👤</span>
                  )}
                  <div>
                     <h3 className="font-display text-xl leading-none text-accent sm:text-2xl">{org.name}</h3>
                    <p className="mt-1 font-mono text-[0.63rem] uppercase tracking-[0.16em] text-primary/90">{org.role}</p>
                  </div>
                </div>
                {org.bio && <p className="mt-3 text-sm italic text-sand/86">{org.bio}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className="topic-card p-8 text-center">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-sand/72">Situation Brief</p>
            <p className="mt-3 font-display text-3xl leading-none text-accent sm:text-4xl">Team Dossier Incoming</p>
            <p className="mt-3 text-sm italic text-sand/84">Organising team details will be published shortly.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
