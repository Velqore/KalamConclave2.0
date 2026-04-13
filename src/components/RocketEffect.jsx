import { useEffect, useState } from 'react'

function random(min, max) {
  return Math.random() * (max - min) + min
}

function RocketEffect() {
  const [rockets, setRockets] = useState([])

  useEffect(() => {
    const spawnRocket = () => {
      const id = crypto.randomUUID()
      const duration = random(4, 7)
      const rocket = {
        id,
        left: random(8, 42),
        bottom: random(-8, 18),
        tx: random(45, 75),
        ty: random(-75, -45),
        duration,
        size: random(1, 1.4),
      }

      setRockets((prev) => [...prev.slice(-2), rocket])
      window.setTimeout(() => {
        setRockets((prev) => prev.filter((item) => item.id !== id))
      }, duration * 1000)
    }

    spawnRocket()
    const interval = window.setInterval(spawnRocket, 2800)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {rockets.map((rocket) => (
        <span
          key={rocket.id}
          className="rocket absolute"
          style={{
            left: `${rocket.left}%`,
            bottom: `${rocket.bottom}%`,
            '--tx': `${rocket.tx}vw`,
            '--ty': `${rocket.ty}vh`,
            animationDuration: `${rocket.duration}s`,
            fontSize: `${rocket.size}rem`,
            filter: 'drop-shadow(0 0 6px #D4611A)',
          }}
        >
          🚀
        </span>
      ))}
    </div>
  )
}

export default RocketEffect
