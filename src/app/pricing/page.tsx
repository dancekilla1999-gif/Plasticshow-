import type { Metadata } from 'next';
import { PriceList } from '@/components/pricing/PriceList';
import { getCity } from '@/content/pricing';

const city = getCity('moscow')!;

export const metadata: Metadata = {
  title: 'Цены 2026 · Москва',
  description:
    'Прайс-лист Plastic Show на 2026 год для Москвы: шоу-программы от 65 000 ₽, велком-перформанс, гоу-гоу, постановка номера, выезды, гос. проекты и новогодний период.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <PriceList city={city} media="atelier-1" />;
}
