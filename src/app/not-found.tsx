import { ButtonLink } from '@/components/ui/Button';
import { Media } from '@/components/ui/Media';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-[var(--gutter)] text-center">
      <div className="absolute inset-0">
        <Media slug="pozhary-1" alt="" sizes="100vw" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-void via-void/85 to-void" />
      </div>

      <div className="relative">
        <p className="display text-[clamp(4rem,20vw,14rem)] leading-none text-transparent [-webkit-text-stroke:1px_var(--color-bone)]">
          404
        </p>
        <p className="display mt-6 text-[clamp(1.2rem,3.4vw,2.4rem)]">Этой сцены здесь нет</p>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ash">
          Страница не найдена — возможно, постановку переименовали или ссылка устарела.
        </p>
        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" variant="solid">На главную <span aria-hidden>→</span></ButtonLink>
          <ButtonLink href="/shows" variant="outline">Репертуар</ButtonLink>
        </div>
      </div>
    </section>
  );
}
