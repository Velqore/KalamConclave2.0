import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CountdownTimer from '../components/CountdownTimer'
import SpeakerCard from '../components/SpeakerCard'
import speakers from '../config/speakers'

function Home() {
  const navigate = useNavigate()

  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-blue-900 bg-gradient-to-br from-navyLight to-navy p-8 shadow-soft"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-electricBlue">Ignite Ideas. Inspire Action.</p>
          <h1 className="mt-3 text-3xl font-bold text-gold sm:text-5xl">1st Kalam Conclave 2.0</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            A platform to dream, innovate, and lead with purpose — inspired by Dr. APJ Abdul Kalam’s vision of empowered youth and nation-building.
          </p>

          <div className="mt-6 space-y-2 text-slate-200">
            <p>21st April 2026 | 10:00 AM Onwards</p>
            <p>K.R. Mangalam University, Aryabhatta Block, 4th Floor</p>
          </div>

          <div className="mt-8 max-w-xl">
            <CountdownTimer />
          </div>

          <button
            className="mt-8 rounded bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-amber-400"
            onClick={() => navigate('/register')}
            type="button"
          >
            Register Now
          </button>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-gold">About the Conclave</h2>
        <p className="mt-4 max-w-4xl text-slate-300">
          1st Kalam Conclave 2.0 is a youth-forward summit designed to foster innovation, scientific temper, and ethical leadership. Following Dr. Kalam’s philosophy, the conclave brings together curious minds to exchange ideas that shape a progressive and inclusive future.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-gold">Speakers</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {speakers.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-bold text-gold">Agenda</h2>
        <div className="mt-6 rounded-2xl border border-dashed border-blue-800 bg-navyLight/40 p-8 text-center">
          <p className="text-lg font-semibold text-electricBlue">Agenda Coming Soon</p>
          <p className="mt-2 text-sm text-slate-300">Our final timeline and sessions will be published shortly.</p>
        </div>
      </section>
    </div>
  )
}

export default Home
