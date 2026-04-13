import schedule from '../config/schedule'

function Schedule() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="rounded-2xl border border-blue-900 bg-navyLight/70 p-8">
        <h1 className="text-3xl font-bold text-gold sm:text-4xl">Agenda Coming Soon</h1>
        <p className="mt-3 text-slate-300">21st April 2026 • 10:00 AM Onwards</p>
      </div>

      <div className="mt-10 space-y-5">
        {schedule.map((item) => (
          <div key={item.id} className="rounded-xl border border-blue-900 bg-navyLight/40 p-5">
            <p className="text-sm font-semibold text-electricBlue">{item.time}</p>
            <h2 className="mt-1 text-xl font-semibold text-gold">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Schedule
