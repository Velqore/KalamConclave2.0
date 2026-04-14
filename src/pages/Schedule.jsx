import { useNavigate } from 'react-router-dom'
import { useAppData } from '../context/useAppData'
import { SUB_EVENTS } from '../config/subEvents'

function Schedule() {
  const navigate = useNavigate()
  const { settings } = useAppData()
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <div className="topic-card p-4 sm:p-8">
        <h1 className="font-display text-4xl leading-none text-accent sm:text-6xl">Events</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-sand/75">
          {settings.event_date_label} • {settings.event_time_label}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
        {SUB_EVENTS.map((event) => (
          <article
            key={event.id}
            className="topic-card flex flex-col p-5 transition-all"
            style={{ borderColor: `${event.color}33` }}
          >
            <span className="text-3xl">{event.icon}</span>
            <h2 className="mt-3 font-display text-2xl leading-none sm:text-3xl" style={{ color: event.color }}>
              {event.name}
            </h2>
            <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-sand/55">
              {event.fullName}
            </p>
            <p className="mt-2 flex-1 text-xs italic text-sand/80">{event.tagline}</p>
            <p className="mt-2 font-mono text-[0.6rem] text-sand/45">📍 {event.venue}</p>
            <button
              className="mt-4 w-full rounded px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              onClick={() => navigate(`/register?event=${event.id}`)}
              style={{ background: `linear-gradient(135deg, ${event.gradientFrom}, ${event.gradientTo})` }}
              type="button"
            >
              Register →
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Schedule
