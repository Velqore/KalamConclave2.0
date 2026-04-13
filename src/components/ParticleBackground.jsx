import { motion as Motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 30 }, (_, i) => {
  const isWar = i % 3 !== 0
  return {
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 2.5 + 0.8,
    duration: Math.random() * 25 + 18,
    delay: Math.random() * 20,
    opacity: Math.random() * 0.35 + 0.08,
    drift: (Math.random() - 0.5) * 80,
    color: isWar
      ? `rgba(${Math.random() > 0.5 ? '217,119,6' : '220,38,38'}, 1)`
      : 'rgba(59,130,246,1)',
  }
})

function ParticleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {PARTICLES.map((p) => (
        <Motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-8px',
            width: p.size,
            height: p.size,
            background: p.color,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -(window.innerHeight + 80)],
            x: [0, p.drift],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

export default ParticleBackground
