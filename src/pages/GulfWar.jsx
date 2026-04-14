const IMPACT_SECTIONS = [
  {
    tag: 'Environmental Destruction',
    icon: '🌍',
    color: '#b45309',
    title: 'Scorched Earth, Poisoned Seas',
    body: [
      'The burning of hundreds of oil wells during the Gulf conflicts released over 500 million tonnes of CO₂ equivalent — one of the largest single-event atmospheric pollutions in recorded history. The resultant "oil climate" disrupted regional monsoon patterns from the Arabian Peninsula to South Asia.',
      'Depleted uranium (DU) munitions used across Gulf battlefields have left half-lives of 4.5 billion years in soil and groundwater. Studies by UNEP confirm elevated DU concentrations in fallout zones, linked to a sharp rise in childhood cancers and congenital disorders — a decades-long biological legacy invisible to the naked eye.',
    ],
  },
  {
    tag: 'Medical & Biological Fallout',
    icon: '🩺',
    color: '#16a34a',
    title: 'Bodies as Battlegrounds',
    body: [
      '"Gulf War Syndrome" — a still-contested cluster of neurological, immunological, and respiratory disorders — affects an estimated 250,000 veterans. Exposure to nerve-agent sarin, pesticide cocktails, and smoke inhalation have generated a living laboratory of long-term multi-system illness.',
      'Conflict zones have become inverse R&D environments: trauma surgeons pioneering tourniquets, haemostatic agents, and damage-control surgery under fire — innovations now standard in civilian ERs — born out of the catastrophic volume of blast injuries.',
    ],
  },
  {
    tag: 'Weapons Technology & AI',
    icon: '🤖',
    color: '#2563eb',
    title: 'Algorithms of War',
    body: [
      'Precision-guided munitions, autonomous drones, and AI targeting systems developed for Gulf operations now form the backbone of 21st-century warfare. The same neural-network architectures used in consumer image recognition are being weaponised for autonomous kill-decision systems — raising profound questions about accountability and the erosion of human oversight in lethal action.',
      'Satellite intelligence and signals-intercept technology matured dramatically through Gulf deployments, giving rise to a dual-use surveillance ecosystem that today underpins both commercial GPS and mass civilian monitoring worldwide.',
    ],
  },
  {
    tag: 'Science Misused',
    icon: '⚗️',
    color: '#dc2626',
    title: 'When Discovery Becomes a Weapon',
    body: [
      'Chemistry that gave us fertilisers — the Haber-Bosch process — also enabled the mass production of explosives and chemical weapons. The same organophosphate chemistry behind pesticides is the foundation of nerve agents like VX and Novichok. Science does not choose its masters; but scientists and policymakers must.',
      'Nuclear physics that promised clean energy handed humanity thermonuclear weapons. Biological sciences that map pathogens for vaccine development can be reversed to engineer pandemic agents. Every major scientific breakthrough of the 20th century carries a dark dual-use shadow — and the Gulf conflicts have exploited almost every one of them.',
    ],
  },
  {
    tag: 'Climate & Geopolitics',
    icon: '🌡️',
    color: '#7c3aed',
    title: 'Resource Wars Accelerate Climate Collapse',
    body: [
      "Wars fought over fossil-fuel reserves paradoxically accelerate the climate crisis that makes resource scarcity worse. The Gulf region, already one of the world's most heat-stressed zones, is on trajectory to exceed 50°C wet-bulb temperatures — rendering large swaths uninhabitable by 2050 without radical intervention.",
      'The carbon footprint of the United States military alone exceeds that of most industrialised nations combined. A single B-52 bombing sortie burns more kerosene than an average Indian household consumes energy in six years. War and climate destruction are not separate crises — they are the same crisis wearing different uniforms.',
    ],
  },
  {
    tag: 'The Way Forward',
    icon: '🔬',
    color: '#0891b2',
    title: 'Science as Peacekeeper',
    body: [
      "From the International Atomic Energy Agency's safeguards regime to the Chemical Weapons Convention, science-backed multilateral frameworks have slowed — if not stopped — some of the worst proliferation risks. Strengthening these institutions, funding open-science diplomacy, and mandating dual-use ethics reviews in research grants are concrete steps.",
      'Ultimately, the generation entering science today will decide whether it heals or harms. Kalam Conclave 2.0 exists precisely to provoke that question — and to cultivate scientists who see ethics not as a constraint, but as the very foundation of discovery.',
    ],
  },
]

function GulfWar() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      {/* Hero */}
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
          Science does not operate in a vacuum. When nations go to war over oil, ideology, and power,
          laboratories become arsenals, ecosystems become casualties, and human bodies become data points.
          This dossier examines how the Gulf conflicts have reshaped science — and how science has, in turn,
          reshaped the nature of destruction.
        </p>
      </div>

      {/* Impact grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {IMPACT_SECTIONS.map((sec) => (
          <article
            key={sec.tag}
            className="topic-card flex flex-col p-5 sm:p-6"
            style={{ borderColor: `${sec.color}33` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">{sec.icon}</span>
              <p
                className="font-mono text-[0.62rem] uppercase tracking-[0.2em]"
                style={{ color: sec.color }}
              >
                {sec.tag}
              </p>
            </div>
            <h2
              className="mt-3 font-display text-2xl leading-tight sm:text-3xl"
              style={{ color: sec.color }}
            >
              {sec.title}
            </h2>
            <div className="mt-3 space-y-3">
              {sec.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-sand/85">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Call-out */}
      <div className="mt-10 rounded-2xl border border-primary/40 bg-surface/50 p-6 text-center sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Kalam Conclave 2.0 Perspective</p>
        <p className="mt-4 font-display text-[clamp(1.4rem,4vw,2.4rem)] leading-snug text-accent">
          "Science is neither inherently good nor evil — it is a mirror of the civilisation that wields it."
        </p>
        <p className="mt-3 text-sm italic text-sand/75">
          Join us on 21st April 2026 at K.R. Mangalam University to explore how the next generation of
          scientists can choose responsibility over destruction, and innovation over annihilation.
        </p>
      </div>
    </div>
  )
}

export default GulfWar
