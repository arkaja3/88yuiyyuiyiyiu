import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://royaltransfer.org'

  return {
    rules: [
      // Основные правила для всех поисковых роботов
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',          // Административная панель
          '/api/',            // Все API-запросы
          '/*?page=*',        // Страницы пагинации
          '/search?*',        // Поисковые запросы
          '/*.php$',          // PHP-файлы (если они есть)
          '/*.js$',           // JS-файлы
          '/*.css$',          // CSS-файлы
          '/*.json$',         // JSON-файлы
          '/private/',        // Приватные страницы
          '/tmp/',            // Временные файлы
          '/download/*',      // Прямые ссылки загрузки
          '/user/*',          // Пользовательские страницы
          '/admin*',          // Все административные роуты
          '/*/print/',        // Страницы печати
          '/*/print$',        // Страницы печати
          '/*.axd$',          // .NET файлы
          '/*.swf$'           // Flash файлы
        ]
      },

      // Специальные правила для Google
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/blog/',
          '/gallery/',
          '/reviews/',
          '/sitemap.xml'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/unsubscribe/',
          '/*.gif$'           // Избегаем индексации некоторых изображений
        ]
      },

      // Правила для изображений Google
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/images/',
          '/public/images/',
          '/public/uploads/',
          '/*.jpg$',
          '/*.jpeg$',
          '/*.png$',
          '/*.webp$',
          '/*.svg$'
        ],
        disallow: [
          '/admin/images/',
          '/images/private/',
          '/images/temp/',
          '/images/icons/'    // Иконки часто не нужно индексировать
        ]
      },

      // Правила для Яндекса
      {
        userAgent: 'Yandex',
        allow: [
          '/',
          '/blog/',
          '/gallery/',
          '/reviews/',
          '/sitemap.xml',
          '/yandex-turbo-feed.xml'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/unsubscribe/'
        ]
      },

      // Яндекс.Картинки
      {
        userAgent: 'YandexImages',
        allow: [
          '/images/',
          '/public/images/',
          '/public/uploads/',
          '/*.jpg$',
          '/*.jpeg$',
          '/*.png$',
          '/*.webp$'
        ]
      },

      // Для Яндекс.Метрики
      {
        userAgent: 'YandexMetrika',
        allow: '/'
      },

      // Запрещаем индексацию Яндекс-Директ
      {
        userAgent: 'YandexDirect',
        disallow: '/'
      },

      // Mail.ru бот
      {
        userAgent: 'Mail.Ru',
        allow: '/',
        disallow: ['/admin/', '/api/']
      },

      // Bing бот
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/']
      },

      // Запрещаем некоторым ботам индексацию
      {
        userAgent: 'Mailbot',
        disallow: '/'
      },

      // Baidu (китайский поисковик)
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/admin/', '/api/']
      },

      // Facebook бот
      {
        userAgent: 'facebookexternalhit',
        allow: '/'
      },

      // Twitter бот
      {
        userAgent: 'Twitterbot',
        allow: '/'
      },

      // LinkedIn бот
      {
        userAgent: 'LinkedInBot',
        allow: '/'
      },

      // WhatsApp бот
      {
        userAgent: 'WhatsApp',
        allow: '/'
      },

      // Telegram бот
      {
        userAgent: 'TelegramBot',
        allow: '/'
      },

      // Другие боты
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/admin/', '/api/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}
