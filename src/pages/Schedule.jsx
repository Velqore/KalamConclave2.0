import { useAppData } from '../context/useAppData'

function Schedule() {
  const { schedule, settings } = useAppData()
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="topic-card p-8">
        <h1 className="font-display text-6xl leading-none text-accent">Events Timeline</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-sand/75">
          {settings.event_date_label} • {settings.event_time_label}
        </p>
      </div>

      <div className="mt-10 space-y-5">
        {schedule.map((item) => (
          <div key={item.id} className="topic-card p-5">
            <span className="text-lg">🧭</span>
            <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-primary/90">
              {item.time}
            </p>
            <h2 className="mt-2 font-display text-4xl leading-none text-accent">{item.title}</h2>
            <p className="mt-2 text-sm italic text-sand/86">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Schedule
