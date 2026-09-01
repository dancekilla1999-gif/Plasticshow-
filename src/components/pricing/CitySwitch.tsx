import Link from 'next/link';
import { CITIES } from '@/content/pricing';

/**
 * City selector for the price lists. Plain links to two static routes rather
 * than client-side state: each city keeps its own URL, metadata and crawlable
 * HTML, and the switch works with JS disabled.
 */
export function CitySwitch({ current }: { current: string }) {
  return (
    <div
      role="group"
      aria-label="Город прайс-листа"
      className="inline-flex flex-wrap gap-2 rounded-full border border-bone/15 p-1.5"
    >
      {CITIES.map((city) => {
        const active = city.slug === current;
        return (
          <Link
            key={city.slug}
            href={city.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-500 ${
              active ? 'bg-bone text-void' : 'text-bone/60 hover:text-bone'
            }`}
          >
            {city.name}
          </Link>
        );
      })}
    </div>
  );
}
