import { Link } from 'react-router-dom'

function GulfWarBanner() {
  return (
    <section className="reveal relative z-10 mx-auto mt-12 w-full max-w-6xl px-4">
      <div
        className="grid items-center gap-5 border border-primary/50 bg-primary/10 p-5 backdrop-blur-md md:grid-cols-[180px_1fr_120px]"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
        }}
      >
        <span
          className="absolute top-0 bottom-0 left-0 w-[3px]"
          style={{ background: 'linear-gradient(180deg, #A01010, #D4611A)' }}
        />

        <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-sand">
          <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
          Live Focus
        </div>

        <div>
          <h3 className="font-display text-[1.6rem] leading-none text-sand">🎯 The Gulf War — Featured Topic</h3>
          <p className="mt-2 text-sm italic text-sand/90">
            Drone warfare, trauma surgery, satellite intelligence &amp; environmental science under
            extreme pressure — science at the front line.
          </p>
        </div>

        <Link
          className="justify-self-start font-mono text-sm uppercase tracking-[0.18em] text-accent transition hover:text-sand md:justify-self-end"
          to="/gulf-war"
        >
          Explore ›
        </Link>
      </div>
    </section>
  )
}

export default GulfWarBanner
