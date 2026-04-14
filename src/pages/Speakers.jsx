import SpeakerCard from '../components/SpeakerCard'
import { useAppData } from '../context/useAppData'

function Speakers() {
  const { speakers } = useAppData()
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <h1 className="font-display text-4xl leading-none text-accent sm:text-6xl">Guests</h1>
      <p className="mt-3 max-w-2xl text-base text-sand/88 sm:text-lg">
        Meet the distinguished guests shaping the dialogue on science, conflict systems, and humanitarian
        innovation.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:mt-8 md:grid-cols-3">
        {speakers.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>
    </section>
  )
}

export default Speakers
