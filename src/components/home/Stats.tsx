const STATS = [
  { value: 11, suffix: '', label: 'лет создаём шоу для брендов и частных клиентов' },
  { value: 5, suffix: '', label: 'стран за пределами России, где выступала команда' },
  { value: 9, suffix: '', label: 'постановок в постоянном репертуаре' },
  { value: 8, suffix: '', label: 'артистов и хореографов в основном составе' },
];

/**
 * Figures are deliberately limited to what the studio's own materials confirm:
 * founding date, geography, repertoire size and company size. No invented
 * "500+ выступлений" style numbers.
 */
export function Stats() {
  return (
    <div
      className="grid gap-px border-y border-bone/10 bg-bone/10 sm:grid-cols-2 lg:grid-cols-4"
      data-reveal-group
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="bg-void px-6 py-12 sm:px-8" data-reveal>
          <p className="display text-[clamp(3rem,7vw,5.5rem)] leading-none text-bone">
            <span data-count={stat.value}>0</span>
            {stat.suffix}
          </p>
          <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-ash">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
