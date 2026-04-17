import { lazy, Suspense, useEffect, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CountdownTimer from '../components/CountdownTimer'
import SpeakerCard from '../components/SpeakerCard'
import GulfWarBanner from '../components/GulfWarBanner'
import Ticker from '../components/Ticker'
import SubEventRulesSlider from '../components/SubEventRulesSlider'
import { EVENT_SHORT_TITLE } from '../config/branding'
import { ORGANISING_HIERARCHY } from '../config/organisingHierarchy'
import { useAppData } from '../context/useAppData'
import { SUB_EVENTS } from '../config/subEvents'
import { getEffectiveRules, loadDefaultRulesMap } from '../lib/subEventRules'
import { getRegistrationDeadline } from '../utils/dateHelpers'

const RocketEffect = lazy(() => import('../components/RocketEffect'))

const ILLUSTRATION_ITEMS = [
  { icon: '🛰️', title: 'Orbital Intelligence', description: 'Satellite sensing and live conflict mapping' },
  { icon: '🧪', title: 'Rapid Science Labs', description: 'Field diagnostics and crisis bio-innovation' },
  { icon: '🛡️', title: 'Defence Engineering', description: 'Resilience systems for critical infrastructure' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
  }),
}

function Home() {
  const navigate = useNavigate()
  const { speakers, settings, organisers } = useAppData()
  const [defaultRulesByEvent, setDefaultRulesByEvent] = useState({})
  const regDeadline = getRegistrationDeadline(settings.event_date)
  const socialLinks = [
    { key: 'instagram', label: 'Instagram', icon: '📸', url: settings.social_instagram_url },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', url: settings.social_linkedin_url },
    { key: 'youtube', label: 'YouTube', icon: '🎥', url: settings.social_youtube_url },
  ].filter((item) => item.url)

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

  useEffect(() => {
    let mounted = true
    loadDefaultRulesMap(SUB_EVENTS).then((map) => {
      if (!mounted) return
      setDefaultRulesByEvent(map)
    })
    return () => {
      mounted = false
    }
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
              'radial-gradient(circle at 70% 40%, rgba(16,80,180,0.30), transparent 42%), radial-gradient(circle at 20% 70%, rgba(0,100,160,0.28), transparent 48%), rgba(10,18,35,0.70)',
          }}
        >
          <Motion.h1
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.9] text-accent"
          >
            <span className="negative-mask-hero">{EVENT_SHORT_TITLE}</span>
          </Motion.h1>

          <Motion.div
            custom={0.2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-2 font-subtitle text-base text-accent sm:text-lg"
          >
            Science in the Shadow of war
          </Motion.div>

          <Motion.p
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-4 max-w-3xl text-base font-bold not-italic text-sand/90 sm:text-xl"
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
            {regDeadline && (
              <p className="mt-1 font-semibold text-primary">
                🗓️ Registration Closes on {regDeadline}
              </p>
            )}
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

      <section className="reveal relative z-10 mx-auto w-full max-w-6xl px-4 pb-4 sm:pb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {ILLUSTRATION_ITEMS.map((item) => (
            <article key={item.title} className="topic-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <h3 className="font-display text-2xl leading-none text-accent">{item.title}</h3>
              </div>
              <p className="mt-2 text-sm italic text-sand/84">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Ticker />
      <GulfWarBanner />

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
          {SUB_EVENTS.map((ev) => {
            const rules = getEffectiveRules({
              settings,
              eventId: ev.id,
              defaults: defaultRulesByEvent,
            })
            return (
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

                <SubEventRulesSlider event={ev} rules={rules} />

                <button
                  className="mt-4 w-full rounded px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  onClick={() => navigate(`/register?event=${ev.id}`)}
                  style={{ background: `linear-gradient(135deg, ${ev.gradientFrom}, ${ev.gradientTo})` }}
                  type="button"
                >
                  Register →
                </button>
              </article>
            )
          })}
        </div>
      </section>

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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {organisers.map((org) => (
              <article key={org.id} className="topic-card p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  {org.image ? (
                    <img
                      alt={org.name}
                      className="h-14 w-14 shrink-0 rounded-full border border-sand/30 object-cover"
                      src={org.image}
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-2xl">
                      👤
                    </span>
                  )}
                  <div>
                    <h3 className="font-display text-xl leading-none text-accent sm:text-2xl">{org.name}</h3>
                    <p className="mt-1 font-mono text-[0.63rem] uppercase tracking-[0.16em] text-primary/90">
                      {org.role}
                    </p>
                  </div>
                </div>
                {org.bio && <p className="mt-3 text-sm italic text-sand/80">{org.bio}</p>}
              </article>
            ))}
          </div>
        ) : (
          <div className="topic-card p-4 sm:p-7">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-sand/72">Organising Body</p>
            <p className="mt-3 leading-relaxed text-sand/90">
              This event is organised by the Dr. A.P.J. Abdul Kalam Science Club of K.R. Mangalam
              University, under the aegis of the Department of Student Welfare (DSW), K.R. Mangalam
              University.
            </p>
            <p className="mt-3 leading-relaxed text-sand/86">
              The Science Club operates under the guidance and patronage of the DSW, which provides
              institutional oversight for the event.
            </p>
            <div className="mt-6">
              <h3 className="font-display text-3xl leading-none text-accent sm:text-4xl">Organising Committee</h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {ORGANISING_HIERARCHY.map((group) => (
                <article key={group.title} className="topic-card p-4">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-primary/90">{group.level}</p>
                  <h4 className="mt-2 font-display text-2xl leading-none text-accent">{group.title}</h4>
                  <p className="mt-2 text-sm italic text-sand/84">{group.description}</p>
                  <ul className="mt-3 space-y-1 text-sm text-sand/90">
                    {group.members.map((member) => (
                      <li key={member}>• {member}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="social-media" className="reveal relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-display text-4xl leading-none text-accent sm:text-5xl">Follow Us</h2>
          <div className="mt-2 h-px w-20 bg-primary/70" />
        </div>
        {socialLinks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {socialLinks.map((social) => (
              <a
                key={social.key}
                className="topic-card flex items-center justify-between gap-3 p-4 transition hover:border-primary/60"
                href={social.url}
                rel="noreferrer"
                target="_blank"
              >
                <div>
                  <p className="font-mono text-[0.63rem] uppercase tracking-[0.16em] text-sand/72">Follow Us</p>
                  <p className="mt-2 font-display text-2xl leading-none text-accent">{social.label}</p>
                </div>
                <span className="text-3xl">{social.icon}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="topic-card p-6 text-sm text-sand/80">
            Social media links will be published soon.
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
