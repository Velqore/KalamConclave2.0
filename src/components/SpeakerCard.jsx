import { motion as Motion } from 'framer-motion'

function SpeakerCard({ speaker }) {
  return (
    <Motion.article
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-blue-900 bg-navyLight/80 p-6 shadow-soft"
    >
      <img
        alt={speaker.name}
        className="mx-auto h-24 w-24 rounded-full border border-blue-800 object-cover"
        src={speaker.image}
      />
      <h3 className="mt-4 text-lg font-semibold text-gold">{speaker.name}</h3>
      <p className="text-sm text-electricBlue">{speaker.title}</p>
      <p className="mt-3 text-sm text-slate-300">{speaker.topic}</p>
    </Motion.article>
  )
}

export default SpeakerCard
