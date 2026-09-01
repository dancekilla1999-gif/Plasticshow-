import type { Metadata, Viewport } from 'next';
import { Unbounded, Manrope, JetBrains_Mono } from 'next/font/google';
import { SITE, CONTACTS } from '@/content/site';
import { Header } from '@/components/layout/Header';
import { BrandSprite } from '@/components/brand/BrandSprite';
import { Footer } from '@/components/layout/Footer';
import { MotionRuntime } from '@/components/motion/MotionRuntime';
import { PageTransition } from '@/components/motion/PageTransition';
import '@/styles/globals.css';

// Display face: geometric, wide, full Cyrillic — carries the oversized headings.
const unbounded = Unbounded({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '700', '900'],
  variable: '--font-unbounded',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500'],
  variable: '--font-manrope',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500'],
  variable: '--font-mono-face',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — продакшн танцевальных шоу премиум-класса`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'танцевальное шоу',
    'шоу на мероприятие',
    'шоу-балет Москва',
    'заказать танцевальное шоу',
    'постановка шоу',
    'сценические костюмы на заказ',
    'perfomance',
    'Plastic Show',
  ],
  authors: [{ name: SITE.legalName }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — продакшн танцевальных шоу премиум-класса`,
    description: SITE.description,
    // Картинка берётся из app/opengraph-image.jpg (файловая конвенция Next).
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — продакшн танцевальных шоу премиум-класса`,
    description: SITE.description,
  },
  manifest: '/site.webmanifest',
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#08080a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'PerformingGroup',
  name: SITE.name,
  alternateName: 'PLASTICSHOW',
  description: SITE.description,
  url: SITE.url,
  foundingDate: SITE.founded,
  slogan: 'Show · Welcome · Go-Go',
  address: SITE.cities.map((city) => ({
    '@type': 'PostalAddress',
    addressLocality: city,
    addressCountry: 'RU',
  })),
  email: CONTACTS.email,
  telephone: `+${CONTACTS.whatsapp}`,
  sameAs: [
    `https://instagram.com/${CONTACTS.instagram}`,
    `https://t.me/${CONTACTS.telegram}`,
  ],
  areaServed: [...SITE.cities, 'Россия', 'Казахстан', 'Китай', 'Турция', 'Армения'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable} ${mono.variable}`}>
      <body className="grain">
        <BrandSprite />
        <script
          type="application/ld+json"
          // Static, build-time constant — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
        />
        <MotionRuntime />
        <Header />
        <PageTransition>
          <main id="main">{children}</main>
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
