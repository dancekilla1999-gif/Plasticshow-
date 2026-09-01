import Link from 'next/link';
import { Wordmark, WordmarkStacked } from '@/components/brand/Wordmark';
import { CONTACTS, NAV, SITE } from '@/content/site';
import { SERVICES } from '@/content/services';
import { CITIES } from '@/content/pricing';
import { instagramLink, mailLink, telegramLink, whatsappLink } from '@/lib/whatsapp';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-bone/10 bg-obsidian">
      <div className="px-[var(--gutter)] pb-10 pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <WordmarkStacked title="Plastic Show" className="h-[4.25rem] w-auto text-bone" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ash">{SITE.description}</p>
          </div>

          <nav aria-label="Навигация в подвале">
            <p className="kicker mb-5">Навигация</p>
            <ul className="space-y-2.5">
              {NAV.slice(1).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="text-sm text-bone/65 transition-colors hover:text-bone"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="kicker mb-5">Прайс по городам</p>
            <ul className="mb-8 space-y-2.5">
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={city.href}
                    prefetch={false}
                    className="text-sm text-bone/65 transition-colors hover:text-bone"
                  >
                    Цены · {city.name}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="kicker mb-5">Услуги</p>
            <ul className="space-y-2.5">
              {SERVICES.slice(0, 4).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services#${service.slug}`}
                    prefetch={false}
                    className="text-sm text-bone/65 transition-colors hover:text-bone"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="kicker mb-5">Связь</p>
            <ul className="space-y-2.5">
              {[
                { label: CONTACTS.whatsappDisplay, href: whatsappLink('Здравствуйте! Хочу обсудить шоу.') },
                { label: `@${CONTACTS.telegram}`, href: telegramLink },
                { label: 'Instagram', href: instagramLink },
                { label: CONTACTS.email, href: mailLink },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-bone/65 transition-colors hover:text-bone"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-ash">{CONTACTS.address}</p>
          </div>
        </div>

        {/* Oversized wordmark, cropped by the viewport edge. */}
        <div aria-hidden className="mt-16 overflow-hidden">
          <Wordmark className="h-auto w-[118%] max-w-none text-bone/[0.06] [&_circle]:fill-bone/[0.06]" />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-bone/10 pt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-ash sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.legalName}. Все права защищены.</span>
          <span>Made with obsession for detail</span>
        </div>
      </div>
    </footer>
  );
}
