import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/layout/Section';
import { Lightbox } from '@/components/gallery/Lightbox';
import { Marquee } from '@/components/ui/Marquee';
import { CTABand } from '@/components/ui/CTABand';
import { ATELIER_STEPS, COSTUMES, MATERIALS } from '@/content/costumes';

export const metadata: Metadata = {
  title: 'Ателье и костюмы',
  description:
    'Собственное ателье Plastic Show: сценические костюмы от эскиза до последней примерки. Итальянский шёлк, кристаллы Preciosa, LED-интеграция, латекс, 3D-печать.',
  alternates: { canonical: '/costumes' },
};

export default function CostumesPage() {
  return (
    <>
      <PageHero
        kicker="Ателье"
        title="Костюмы для движения"
        lead="Собственное производство сценических костюмов: от эскиза до последней примерки. Каждая вещь рассчитана на свет софитов и амплитуду танца."
        media="black-gold"
      />

      {/* Process — four steps as a numbered rail. */}
      <Section kicker="Процесс" title="Как создаётся костюм">
        <ol className="grid gap-px bg-bone/10 md:grid-cols-2 lg:grid-cols-4" data-reveal-group>
          {ATELIER_STEPS.map((step) => (
            <li key={step.index} className="bg-void p-7 sm:p-9" data-reveal>
              <span className="display block text-[clamp(2.2rem,5vw,3.6rem)] leading-none text-bone/15">
                {step.index}
              </span>
              <h3 className="display mt-7 text-base sm:text-lg">{step.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ash">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Marquee
        items={MATERIALS}
        duration={46}
        className="border-y border-bone/10 py-6 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/45"
      />

      <Section
        kicker="Работы ателье"
        title={<>Образы <span className="text-scarlet">из архива</span></>}
        lead="Костюмы, созданные для постановок репертуара. Каждый образ существует в единственном экземпляре и шьётся по индивидуальным меркам."
      >
        <Lightbox
          items={COSTUMES.map((costume) => ({
            slug: costume.media,
            title: costume.title,
            caption: `${costume.cat} — ${costume.title}`,
          }))}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          tileClassName="aspect-[4/5]"
        />
      </Section>

      {/* Branding block */}
      <section className="px-[var(--gutter)] pb-[clamp(4rem,10vw,8rem)]">
        <div className="border border-bone/12 p-8 sm:p-12 lg:p-16" data-reveal>
          <p className="kicker mb-7">Кастомизация</p>
          <h2 className="display max-w-3xl text-[clamp(1.5rem,4vw,3rem)]">
            Ваш бренд внутри костюма
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-ash">
            Цвета айдентики, логотипы, фирменные элементы — интегрируем бренд в костюм так, чтобы
            это выглядело как couture, а не как реклама.
          </p>
          <div className="mt-9 grid gap-px bg-bone/10 sm:grid-cols-3">
            {[
              { title: 'Эскиз → примерки → костюм', text: 'Полный цикл внутри ателье.' },
              { title: 'Люксовые материалы', text: 'Ткани, кристаллы, LED-компоненты.' },
              { title: 'Конструкция под движение', text: 'Тест в амплитуде и под светом.' },
            ].map((item) => (
              <div key={item.title} className="bg-void p-6">
                <p className="display text-sm sm:text-base">{item.title}</p>
                <p className="mt-3 text-sm text-ash">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        kicker="Ателье"
        title={<>Сошьём <span className="text-scarlet">под вашу сцену</span></>}
        text="Работаем не только для собственных шоу — принимаем заказы от театров, артистов и брендов."
        primary={{ href: '/contact', label: 'Заказать костюмы' }}
        media="gold-silk"
      />
    </>
  );
}
