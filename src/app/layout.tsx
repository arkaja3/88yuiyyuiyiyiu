import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientBody from './ClientBody'
import { SettingsProvider } from '@/lib/settings-context'
import { HomeSettingsProvider } from '@/lib/home-settings-context'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import './globals.css'
import './server-init' // Инициализация серверных ресурсов (выполняется только на сервере)
import dynamic from 'next/dynamic'
import { companyInfo, generateLocalBusinessSchema, generateWebsiteSchema } from '@/lib/structuredData'

// Динамически загружаем аналитику на клиенте
const AnalyticsScripts = dynamic(() => import('@/lib/analytics'), { ssr: false })

// Загружаем шрифт Inter с поддержкой латиницы и кириллицы
const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
})

// Основные метаданные сайта
const siteTitle = 'RoyalTransfer - Комфортные трансферы из Калининграда в Европу'
const siteDescription = 'Трансферы из Калининграда в города Европы: Гданьск, Варшава, Берлин. Комфортабельные автомобили, опытные водители, безопасность и пунктуальность. Индивидуальный подход к каждому клиенту.'
const siteKeywords = 'трансфер, Калининград, Европа, Гданьск, Варшава, Берлин, такси, аэропорт, перевозки, поездки, трансфер в Польшу, трансфер в Германию, поездка в Европу'
const siteImage = '/images/logo.png'
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://royaltransfer.org'

// Метаданные для SEO
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  alternates: {
    canonical: '/',
    languages: {
      'ru-RU': '/',
      'en-US': '/en',
    },
    types: {
      'application/rss+xml': [
        { url: 'api/feed/rss', title: 'RSS Feed - RoyalTransfer Blog' }
      ]
    }
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: 'RoyalTransfer',
    images: [
      {
        url: `${siteUrl}${siteImage}`,
        width: 800,
        height: 600,
        alt: 'RoyalTransfer - Трансферы в Европу',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}${siteImage}`],
    creator: '@royaltransfer',
    site: '@royaltransfer',
  },
  verification: {
    google: 'verify-code', // Требуется заменить на реальный код верификации
    yandex: 'verify-code', // Требуется заменить на реальный код верификации
    bing: '5A1C6D19C8713847381F0EFFB8A1B36F', // Код из BingSiteAuth.xml
  },
  authors: [{ name: 'RoyalTransfer', url: siteUrl }],
  publisher: 'RoyalTransfer',
  creator: 'RoyalTransfer',
  manifest: '/manifest.json',
  applicationName: 'RoyalTransfer',
  category: 'travel',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: true,
    url: true,
  },
  other: {
    // Дополнительные метатеги
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'RoyalTransfer',
    'msapplication-TileColor': '#2b5797',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#2b5797',
    // Метатеги для социальных сетей в России
    'vk:image': `${siteUrl}${siteImage}`,
    'vk:title': siteTitle,
    'vk:description': siteDescription,
    // Метатеги для быстрой загрузки и индексации
    'yandex-verification': 'e6c9aa1bbc77d0e1',
    'indexing-priority': 'normal',
    'revisit-after': '7 days',
    'rating': 'general',
    'referrer': 'origin-when-cross-origin',
    'geo.placename': 'Калининград, Россия',
    'geo.region': 'RU-KGD',
    'geo.position': '54.7065;20.5109',
    'ICBM': '54.7065, 20.5109',
  }
}

// Добавляем публичные переменные для клиента
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  colorScheme: 'light dark',
}

// Добавляем переменные для системы заказов
process.env.NEXT_PUBLIC_TRANSFER_REQUEST_EMAIL = process.env.TRANSFER_REQUEST_EMAIL || 'info@royaltransfer.org'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Генерируем JSON-LD разметку
  const localBusinessSchema = generateLocalBusinessSchema(20, 4.9);
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <link rel="icon" href="/images/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="recipient-email" content={process.env.NEXT_PUBLIC_TRANSFER_REQUEST_EMAIL || ''} />

        {/* Специальные метатеги для логотипа в Google Search */}
        <meta name="thumbnail" content="/images/logo-48x48.png" />
        <meta itemProp="image" content={`${siteUrl}/images/logo-48x48.png`} />

        {/* JSON-LD структурированные данные */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Ссылки на альтернативные форматы */}
        <link rel="alternate" type="application/rss+xml" title="RoyalTransfer Blog" href="/api/feed/rss" />
        <link rel="sitemap" type="application/xml" href="/api/sitemap-index" />
        <link rel="alternate" type="application/xml" title="Turbo-страницы Яндекса" href="/yandex-turbo-feed.xml" />

        {/* Предзагрузка критических ресурсов */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* DNS-prefetch для ускорения работы внешних сервисов */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//mc.yandex.ru" />
      </head>
      <ClientBody>
        <AnalyticsScripts />
        <Providers>
          <SettingsProvider>
            <HomeSettingsProvider>
              {children}
              <Toaster position="top-right" richColors />
            </HomeSettingsProvider>
          </SettingsProvider>
        </Providers>
      </ClientBody>
    </html>
  )
}
