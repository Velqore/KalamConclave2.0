function Footer() {
  return (
    <footer className="relative border-t border-crimson/20 bg-navy py-10">
      <div className="section-divider absolute top-0 left-0 w-full" />
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="shimmer-text font-display text-lg font-bold">Kalam Conclave 2.0</p>
            <p className="text-sm italic text-crimson/80">"Science In the Shadows of War"</p>
          </div>
          <div className="space-y-1 text-sm text-slate-400">
            <p>📍 K.R. Mangalam University, Aryabhatta Block, 4th Floor</p>
            <p>📅 21st April 2026 | 10:00 AM Onwards</p>
            <p>✉️ conclave@kalamconclave.org</p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-600">
          <p>© 2026 Kalam Conclave 2.0. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
