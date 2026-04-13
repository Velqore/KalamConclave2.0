function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-blue-900 bg-navyLight/70 p-5 shadow-soft">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gold">{value}</p>
    </div>
  )
}

export default StatCard
