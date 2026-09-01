import type { Metadata } from 'next';
import { PriceList } from '@/components/pricing/PriceList';
import { getCity } from '@/content/pricing';

const city = getCity('ekaterinburg')!;

export const metadata: Metadata = {
  title: 'Цены 2026 · Екатеринбург',
  description:
    'Прайс-лист Plastic Show на 2026 год для Екатеринбурга: сценические номера от 40 000 ₽, велком, гоу-гоу, иммерсивная постановка с нуля, срочный проект за 2 дня и новогодний период.',
  alternates: { canonical: '/pricing/ekaterinburg' },
};

export default function EkaterinburgPricingPage() {
  return <PriceList city={city} media="khokhloma" />;
}
