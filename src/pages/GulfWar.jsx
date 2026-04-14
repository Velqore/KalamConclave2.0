function GulfWar() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <div
        className="topic-card p-5 sm:p-8"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(160,16,16,0.25), transparent 44%), rgba(42,37,24,0.45)',
        }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Live Focus Dossier</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,9vw,6rem)] leading-[0.85] text-accent">
          The Gulf War
        </h1>
        <p className="mt-4 max-w-3xl text-base italic text-sand/90 sm:text-lg">
          Deep dives on drone warfare, battlefield medicine, intelligence systems, environmental
          fallout, and emerging scientific ethics under armed conflict.
        </p>
      </div>
    </section>
  )
}

export default GulfWar
