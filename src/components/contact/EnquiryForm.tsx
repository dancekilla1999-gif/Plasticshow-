'use client';

import { useState, type FormEvent } from 'react';
import { ButtonAction } from '@/components/ui/Button';
import { whatsappLink } from '@/lib/whatsapp';

const EVENT_TYPES = [
  'Корпоративное событие',
  'Свадьба',
  'Частный вечер',
  'Фестиваль / концерт',
  'Fashion / презентация бренда',
  'Костюмы на заказ',
  'Другое',
];

type Errors = Partial<Record<'name' | 'contact', string>>;

/**
 * Enquiry form. There is no backend in this static build, so a valid submission
 * composes the message and hands it to WhatsApp — the channel the studio
 * actually answers on. Validation runs locally and is announced to screen
 * readers via aria-invalid + aria-describedby.
 *
 * To move to a real endpoint later, replace the `window.open` in `onSubmit`
 * with a fetch to your handler; nothing else here needs to change.
 */
export function EnquiryForm() {
  const [values, setValues] = useState({
    name: '',
    contact: '',
    type: EVENT_TYPES[0],
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = 'Укажите, пожалуйста, имя';
    if (values.contact.trim().length < 5) {
      next.contact = 'Нужен телефон, e-mail или ник в мессенджере';
    }
    return next;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    const text = [
      'Здравствуйте! Заявка с сайта Plastic Show.',
      `Имя: ${values.name.trim()}`,
      `Связь: ${values.contact.trim()}`,
      `Тип события: ${values.type}`,
      values.message.trim() && `Детали: ${values.message.trim()}`,
    ]
      .filter(Boolean)
      .join('\n');

    window.open(whatsappLink(text), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const field =
    'peer w-full border-b border-bone/20 bg-transparent py-4 text-base text-bone outline-none transition-colors duration-400 placeholder:text-transparent focus:border-bone aria-[invalid=true]:border-scarlet';
  const label =
    'pointer-events-none absolute left-0 top-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ash transition-all duration-400 peer-focus:-translate-y-5 peer-focus:text-[9px] peer-focus:text-bone peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:text-[9px]';

  if (sent) {
    return (
      <div role="status" className="border border-bone/15 p-10 text-center sm:p-14">
        <p className="display text-[clamp(1.3rem,3vw,2.2rem)]">Заявка собрана</p>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ash">
          Мы открыли WhatsApp с готовым текстом — отправьте сообщение, и мы ответим в течение
          часа в рабочее время. Если окно не открылось, напишите нам напрямую.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setValues({ name: '', contact: '', type: EVENT_TYPES[0], message: '' }); }}
          className="mt-9 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/70 underline underline-offset-8 transition-colors hover:text-bone"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-9">
      <div className="relative">
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ваше имя"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={field}
        />
        <label htmlFor="name" className={label}>Ваше имя</label>
        {errors.name && (
          <p id="name-error" role="alert" className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ember">
            {errors.name}
          </p>
        )}
      </div>

      <div className="relative">
        <input
          id="contact"
          name="contact"
          type="text"
          placeholder="Телефон или мессенджер"
          autoComplete="tel"
          value={values.contact}
          onChange={(e) => setValues((v) => ({ ...v, contact: e.target.value }))}
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? 'contact-error' : undefined}
          className={field}
        />
        <label htmlFor="contact" className={label}>Телефон или мессенджер</label>
        {errors.contact && (
          <p id="contact-error" role="alert" className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ember">
            {errors.contact}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="kicker mb-4 block">Тип события</label>
        <select
          id="type"
          name="type"
          value={values.type}
          onChange={(e) => setValues((v) => ({ ...v, type: e.target.value }))}
          className="w-full appearance-none border-b border-bone/20 bg-transparent py-4 text-base text-bone outline-none transition-colors focus:border-bone"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type} className="bg-obsidian text-bone">
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Расскажите о событии"
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className={`${field} resize-none`}
        />
        <label htmlFor="message" className={label}>Расскажите о событии</label>
      </div>

      <div className="flex flex-col gap-6 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <ButtonAction type="submit" variant="solid">
          Отправить заявку <span aria-hidden>→</span>
        </ButtonAction>
        <p className="max-w-xs text-xs leading-relaxed text-ash">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных. Заявка откроется
          в WhatsApp с готовым текстом.
        </p>
      </div>
    </form>
  );
}
