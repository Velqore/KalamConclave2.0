import SpeakerCard from '../components/SpeakerCard'
import speakers from '../config/speakers'

function Speakers() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <h1 className="font-display text-6xl leading-none text-accent">Speakers</h1>
      <p className="mt-3 max-w-2xl text-sand/88">
        Meet the voices shaping the dialogue on science, conflict systems, and humanitarian
        innovation.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {speakers.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>
    </section>
  )
}

export default Speakers
