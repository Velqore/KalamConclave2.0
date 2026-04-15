import { useAppData } from '../context/useAppData'

function Schedule() {
  const { settings, schedule } = useAppData()
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <div className="topic-card p-4 sm:p-8">
        <h1 className="font-display text-4xl leading-none text-accent sm:text-6xl">Schedule</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-sand/75">
          {settings.event_date_label} • {settings.event_time_label}
        </p>
      </div>

      {/* Schedule items */}
      {schedule.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <div className="space-y-3">
            {schedule.map((item) => {
              const isParallel = item.title === 'PARALLEL SESSIONS'
              // For parallel sessions, description is 4 lines: trackA, venueA, trackB, venueB
              const tracks = isParallel
                ? (() => {
                    const lines = item.description.split('\n')
                    return [
                      { label: lines[0] ?? '', venue: lines[1] ?? '' },
                      { label: lines[2] ?? '', venue: lines[3] ?? '' },
                    ]
                  })()
                : null

              return (
                <div
                  key={item.id}
                  className="topic-card flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:gap-6"
                >
                  <span className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-primary/90 sm:w-28 sm:pt-0.5">
                    {item.time}
                  </span>
                  {isParallel ? (
                    <div className="flex-1">
                      <p className="mb-2 font-semibold text-sand">{item.title}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {tracks.map((track, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2"
                          >
                            <p className="text-sm font-medium text-sand/95">{track.label}</p>
                            <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-primary/80">
                              {track.venue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-sand">{item.title}</p>
                      {item.description && (
                        <p className="mt-1 text-sm italic text-sand/70">{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default Schedule
