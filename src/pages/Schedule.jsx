import { useNavigate } from 'react-router-dom'
import { useAppData } from '../context/useAppData'
import { SUB_EVENTS } from '../config/subEvents'

function Schedule() {
  const navigate = useNavigate()
  const { settings, schedule } = useAppData()
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <div className="topic-card p-4 sm:p-8">
        <h1 className="font-display text-4xl leading-none text-accent sm:text-6xl">Schedule</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-sand/75">
          {settings.event_date_label} • {settings.event_time_label}
        </p>
      </div>

      {/* Agenda / time-based schedule */}
      {schedule.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="font-display text-3xl leading-none text-sand sm:text-4xl">
            Day <span className="text-accent">Agenda</span>
          </h2>
          <div className="mt-2 h-px w-16 bg-primary/70" />
          <div className="mt-6 space-y-3">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="topic-card flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:gap-6"
              >
                <span className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-primary/90 sm:w-28 sm:pt-0.5">
                  {item.time}
                </span>
                <div>
                  <p className="font-semibold text-sand">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-sm italic text-sand/70">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sub-events */}
      <section className="mt-10 sm:mt-14">
        <h2 className="font-display text-3xl leading-none text-sand sm:text-4xl">
          Choose Your <span className="text-accent">Battleground</span>
        </h2>
        <div className="mt-2 h-px w-16 bg-primary/70" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUB_EVENTS.map((event) => (
            <article
              key={event.id}
              className="topic-card flex flex-col p-5 transition-all"
              style={{ borderColor: `${event.color}33` }}
            >
              <span className="text-3xl">{event.icon}</span>
              <h3 className="mt-3 font-display text-2xl leading-none sm:text-3xl" style={{ color: event.color }}>
                {event.name}
              </h3>
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
    </div>
  )
}

export default Schedule
