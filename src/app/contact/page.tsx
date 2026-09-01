import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { EnquiryForm } from '@/components/contact/EnquiryForm';
import { CONTACTS, GEOGRAPHY } from '@/content/site';
import { instagramLink, mailLink, telegramLink, whatsappLink } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Контакты',
  description:
    'Заказать танцевальное шоу Plastic Show: WhatsApp +7 966 705-66-75, Telegram @efremcha, efremcha.n@yandex.ru. Москва, выезд в любую точку мира.',
  alternates: { canonical: '/contact' },
};

const CHANNELS = [
  { label: 'WhatsApp', value: CONTACTS.whatsappDisplay, href: whatsappLink('Здравствуйте! Хочу обсудить шоу.') },
  { label: 'Telegram', value: `@${CONTACTS.telegram}`, href: telegramLink },
  { label: 'Instagram', value: `@${CONTACTS.instagram}`, href: instagramLink },
  { label: 'Email', value: CONTACTS.email, href: mailLink },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Контакты"
        title="Давайте создадим ваше шоу"
        lead="Ответим в течение часа в рабочее время. Расскажите о событии — предложим концепцию, состав и смету."
        media="noir"
      />

      <section className="px-[var(--gutter)] py-[clamp(3.5rem,9vw,7rem)]">
        <div className="grid gap-[clamp(3rem,7vw,6rem)] lg:grid-cols-[1.1fr_0.9fr]">
          <div data-reveal>
            <p className="kicker mb-9">Заявка</p>
            <EnquiryForm />
          </div>

          <aside className="lg:pl-[clamp(1rem,4vw,4rem)]">
            <p className="kicker mb-9">Прямая связь</p>
            <ul className="divide-y divide-bone/10 border-y border-bone/10" data-reveal-group>
              {CHANNELS.map((channel) => (
                <li key={channel.label} data-reveal>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-5 py-6 transition-colors duration-500 hover:text-bone"
                  >
                    <span className="kicker transition-colors group-hover:text-ember">
                      {channel.label}
                    </span>
                    <span className="text-right text-sm text-bone/85 sm:text-base">
                      {channel.value}
                      <span
                        aria-hidden
                        className="ml-3 inline-block transition-transform duration-500 group-hover:translate-x-1.5"
                      >
                        →
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-12" data-reveal>
              <p className="kicker mb-5">Где мы</p>
              <p className="text-base leading-relaxed text-bone/80">{CONTACTS.address}</p>
            </div>

            <div className="mt-12" data-reveal>
              <p className="kicker mb-5">География выездов</p>
              <ul className="flex flex-wrap gap-2.5">
                {[...GEOGRAPHY.russia, ...GEOGRAPHY.countries].map((place) => (
                  <li
                    key={place}
                    className="rounded-full border border-bone/15 px-4 py-2 text-sm text-bone/70"
                  >
                    {place}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
