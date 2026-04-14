import { motion as Motion } from 'framer-motion'

function SpeakerCard({ speaker }) {
  return (
    <Motion.article whileHover={{ y: -3 }} className="topic-card p-6">
      <div className="flex items-center gap-3">
        <span className="text-xl">🎙️</span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-sand/75">
          Guest Brief
        </span>
      </div>

      <img alt={speaker.name} className="mt-4 h-20 w-20 rounded-full border border-sand/30 object-cover" src={speaker.image} />

      <h3 className="mt-4 font-display text-3xl leading-none text-accent">{speaker.name}</h3>
      <p className="mt-1 text-xs font-mono uppercase tracking-[0.16em] text-primary/90">{speaker.title}</p>
      <p className="mt-3 text-sm italic text-sand/90">{speaker.topic}</p>
    </Motion.article>
  )
}

export default SpeakerCard
