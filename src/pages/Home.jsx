import { motion as Motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CountdownTimer from '../components/CountdownTimer'
import SpeakerCard from '../components/SpeakerCard'
import ParticleBackground from '../components/ParticleBackground'
import speakers from '../config/speakers'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: 'easeOut' },
  }),
}

function AnimatedSection({ id, children, className = '' }) {
  return (
    <Motion.section
      id={id}
      className={`relative mx-auto w-full max-w-6xl px-4 py-16 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
    >
      {children}
    </Motion.section>
  )
}

function SectionTitle({ children, accent = 'war' }) {
  return (
    <div className="mb-8">
      <h2 className="inline-block text-2xl font-bold text-gold">{children}</h2>
      <div
        className={`mt-1.5 h-0.5 w-16 rounded-full ${accent === 'war' ? 'bg-crimson' : 'bg-electricBlue'}`}
      />
    </div>
  )
}

function Home() {
  const navigate = useNavigate()

  return (
    <div className="relative">
      <ParticleBackground />

      {/* HERO */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20">
        <Motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl border border-crimson/35 bg-gradient-to-br from-navyLight via-navy to-navyMid p-8 shadow-war sm:p-14"
        >
          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Corner accents */}
          <span className="pointer-events-none absolute top-0 left-0 h-12 w-12 rounded-tl-2xl border-t-2 border-l-2 border-crimson/50" />
          <span className="pointer-events-none absolute right-0 bottom-0 h-12 w-12 rounded-br-2xl border-b-2 border-r-2 border-electricBlue/40" />

          <div className="relative z-10">
            <Motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-electricBlue/80"
            >
              ▶ Classified Summit — April 21, 2026
            </Motion.p>

            <Motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.65 }}
              className="shimmer-text mt-4 font-display text-4xl font-black sm:text-6xl"
            >
              Kalam Conclave 2.0
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.6 }}
              className="mt-3 text-xl font-semibold italic text-warRed sm:text-2xl"
              style={{ textShadow: '0 0 25px rgba(220,38,38,0.45)' }}
            >
              "Science In the Shadows of War"
            </Motion.p>

            <Motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-5 max-w-2xl leading-relaxed text-slate-300/90"
            >
              A platform to dream, innovate, and lead with purpose — inspired by Dr. APJ Abdul
              Kalam&apos;s vision of empowered youth and nation-building through science, defense,
              and discovery.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="mt-6 space-y-1.5 font-mono text-sm text-slate-400"
            >
              <p>📅 21st April 2026 &nbsp;|&nbsp; 10:00 AM Onwards</p>
              <p>📍 K.R. Mangalam University, Aryabhatta Block, 4th Floor</p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="mt-8 max-w-xl"
            >
              <CountdownTimer />
            </Motion.div>

            <Motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.15 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 28px rgba(245,158,11,0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 rounded border border-gold bg-gold px-7 py-3 font-semibold text-navy transition-all"
              onClick={() => navigate('/register')}
              type="button"
            >
              Register Now →
            </Motion.button>
          </div>
        </Motion.div>
      </section>

      <div className="section-divider mx-auto max-w-6xl px-4" />

      {/* ABOUT */}
      <AnimatedSection id="about">
        <SectionTitle accent="war">About the Conclave</SectionTitle>
        <div className="card-war p-6 sm:p-8">
          <p className="leading-relaxed text-slate-300">
            Kalam Conclave 2.0 is a youth-forward summit designed to foster innovation, scientific
            temper, and ethical leadership under the shadow of a world shaped by conflict and
            crisis. Themed{' '}
            <span className="font-semibold italic text-warRed">
              &ldquo;Science In the Shadows of War&rdquo;
            </span>
            , this edition explores how scientific breakthroughs have emerged in humanity&apos;s
            darkest hours — and how today&apos;s generation can channel that same urgency towards
            peace and progress.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            Following Dr. Kalam&apos;s philosophy, the conclave brings together curious minds to
            exchange ideas that shape a progressive and inclusive future.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: '🔬', title: 'Science', desc: 'Innovation at the frontier' },
              { icon: '⚔️', title: 'Context', desc: 'Knowledge forged in crisis' },
              { icon: '🕊️', title: 'Vision', desc: "Kalam's dream for tomorrow" },
            ].map((item) => (
              <Motion.div
                key={item.title}
                whileHover={{ y: -4 }}
                className="rounded-xl border border-slate-700/50 bg-navy/60 p-4 text-center"
              >
                <p className="text-2xl">{item.icon}</p>
                <p className="mt-2 font-semibold text-gold">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
              </Motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <div className="section-divider mx-auto max-w-6xl px-4" />

      {/* SPEAKERS */}
      <AnimatedSection id="speakers">
        <SectionTitle accent="science">Featured Speakers</SectionTitle>
        <div className="grid gap-5 md:grid-cols-3">
          {speakers.map((speaker, i) => (
            <Motion.div key={speaker.id} custom={i} variants={fadeUp}>
              <SpeakerCard speaker={speaker} />
            </Motion.div>
          ))}
        </div>
      </AnimatedSection>

      <div className="section-divider mx-auto max-w-6xl px-4" />

      {/* ORGANISERS */}
      <AnimatedSection id="organisers">
        <SectionTitle accent="war">Organisers</SectionTitle>
        <div className="card-war p-8 text-center">
          <Motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-electricBlue/70">
              ▶ Classified — Details Incoming
            </p>
          </Motion.div>
          <p className="mt-4 text-xl font-semibold text-gold">Organiser Details Coming Soon</p>
          <p className="mt-2 text-sm text-slate-400">
            The organising team will be announced shortly. Stay tuned.
          </p>
          <div className="mx-auto mt-6 h-0.5 w-16 rounded-full bg-crimson/40" />
        </div>
      </AnimatedSection>

      <div className="section-divider mx-auto max-w-6xl px-4" />

      {/* AGENDA */}
      <AnimatedSection id="agenda">
        <SectionTitle accent="science">Agenda</SectionTitle>
        <div className="card-science p-8 text-center">
          <Motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-electricBlue/70">
              ▶ Timeline Under Construction
            </p>
          </Motion.div>
          <p className="mt-4 text-xl font-semibold text-electricBlue">Agenda Coming Soon</p>
          <p className="mt-2 text-sm text-slate-400">
            Our final timeline and sessions will be published shortly.
          </p>
          <div className="mx-auto mt-6 h-0.5 w-16 rounded-full bg-electricBlue/40" />
        </div>
      </AnimatedSection>
    </div>
  )
}

export default Home
