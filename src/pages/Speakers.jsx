import SpeakerCard from '../components/SpeakerCard'
import speakers from '../config/speakers'

function Speakers() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-gold sm:text-4xl">Speakers</h1>
      <p className="mt-3 text-slate-300">Meet the voices shaping the conversation at Kalam Conclave 2.0.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {speakers.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>
    </section>
  )
}

export default Speakers
