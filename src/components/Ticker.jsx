const items = [
  'Gulf War & Science',
  'Military Tech & Innovation',
  'Humanitarian Research',
  'Environmental Warfare',
  'Crisis Medicine',
  'Weapons & Ethics',
  'AI in Armed Conflict',
]

function Ticker() {
  const strip = [...items, ...items]

  return (
    <div className="relative z-10 mt-10 overflow-hidden border-y border-primary/30 bg-primary/10">
      <div className="ticker-track flex w-max gap-10 py-2.5">
        {strip.map((item, index) => {
          const pass = index < items.length ? 'first' : 'second'
          const itemIndex = index % items.length
          return (
          <span
            key={`${pass}-${itemIndex}`}
            className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-sand/90"
          >
            {`// ${item}`}
          </span>
          )
        })}
      </div>
    </div>
  )
}

export default Ticker
