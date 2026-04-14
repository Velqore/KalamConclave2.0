import { motion as Motion } from 'framer-motion'

function SpeakerCard({ speaker }) {
  return (
    <Motion.article whileHover={{ y: -3 }} className="topic-card p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="text-xl">🎙️</span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-sand/75">
          Guest Brief
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 sm:block sm:mt-4">
        <img
          alt={speaker.name}
          className="h-16 w-16 shrink-0 rounded-full border border-sand/30 object-cover sm:h-20 sm:w-20"
          src={speaker.image}
        />
        <div className="sm:mt-4">
          <h3 className="font-display text-2xl leading-none text-accent sm:text-3xl">{speaker.name}</h3>
          <p className="mt-1 text-xs font-mono uppercase tracking-[0.16em] text-primary/90">{speaker.title}</p>
        </div>
      </div>

      <p className="mt-3 text-sm italic text-sand/90">{speaker.topic}</p>
    </Motion.article>
  )
}

export default SpeakerCard
