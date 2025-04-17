import { PrismaClient } from '@prisma/client'
import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://royaltransfer.org'

// Расширенный интерфейс для sitemap с поддержкой изображений и видео
interface EnhancedSitemapItem {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    url: string;
    title?: string;
    caption?: string;
    geo_location?: string;
    license?: string;
  }>;
  videos?: Array<{
    thumbnail_loc: string;
    title: string;
    description: string;
    content_loc?: string;
    player_loc?: string;
    duration?: number;
    publication_date?: string;
    tags?: string[];
  }>;
}

export default async function sitemap(): Promise<EnhancedSitemapItem[]> {
  let prisma: PrismaClient | null = null

  try {
    // Создаем новый экземпляр PrismaClient
    prisma = new PrismaClient()

    // Проверяем соединение с базой данных
    await prisma.$connect()

    // Основные страницы сайта (статические)
    const staticRoutes: EnhancedSitemapItem[] = [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
        images: [
          {
            url: `${baseUrl}/images/logo.png`,
            title: 'RoyalTransfer - Трансферы из Калининграда в Европу',
            caption: 'Логотип компании RoyalTransfer'
          }
        ]
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8
      },
      {
        url: `${baseUrl}/reviews`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/gallery`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3
      }
    ]

    // Если prisma успешно инициализирован, получаем динамические данные
    if (prisma) {
      try {
        // Получаем все опубликованные посты блога
        const posts = await prisma.blogPost.findMany({
          where: {
            isPublished: true
          },
          select: {
            slug: true,
            updatedAt: true,
            title: true,
            imageUrl: true,
            createdAt: true
          }
        })

        // Получаем все галереи с фотографиями
        const galleries = await prisma.photoGallery.findMany({
          select: {
            slug: true,
            updatedAt: true,
            title: true,
            photos: {
              select: {
                id: true,
                url: true,
                title: true,
                description: true
              }
            }
          }
        })

        // Создаем записи для sitemap из блог постов с метаданными изображений
        const blogEntries: EnhancedSitemapItem[] = posts.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
          images: post.imageUrl ? [
            {
              url: post.imageUrl,
              title: post.title,
              caption: `${post.title} - RoyalTransfer Blog`
            }
          ] : undefined
        }))

        // Создаем записи для галерей с метаданными для всех изображений
        const galleryEntries: EnhancedSitemapItem[] = galleries.map((gallery) => {
          const galleryImages = gallery.photos.map(photo => ({
            url: photo.url,
            title: photo.title || gallery.title,
            caption: photo.description || `Фотография из галереи "${gallery.title}"`
          }))

          return {
            url: `${baseUrl}/gallery/${gallery.slug}`,
            lastModified: gallery.updatedAt,
            changeFrequency: 'monthly',
            priority: 0.6,
            images: galleryImages.length > 0 ? galleryImages : undefined
          }
        })

        // Динамически получаем статические маршруты из базы данных
        const routes_db = await prisma.route.findMany({
          select: {
            id: true,
            updatedAt: true,
            originCity: true,       // Исправлено с fromLocation на originCity
            destinationCity: true,  // Исправлено с toLocation на destinationCity
            description: true
          }
        })

        // Создаем отдельные URL для каждого маршрута
        const routeEntries: EnhancedSitemapItem[] = routes_db.map((route) => ({
          url: `${baseUrl}/routes/${route.id}`,
          lastModified: route.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.5,
          // Можно добавить схематическое изображение маршрута, если оно есть
          images: [
            {
              url: `${baseUrl}/images/routes/route-${route.id}.jpg`,
              title: `Маршрут ${route.originCity} - ${route.destinationCity}`,  // Исправлено
              caption: `Схема маршрута из ${route.originCity} в ${route.destinationCity}`  // Исправлено
            }
          ]
        }))

        // Получаем видео контент, если он есть
        // const videos = await prisma.videoContent.findMany({...}) - замените на вашу модель, если она есть

        // Пример добавления видео-контента (если есть)
        const videoEntries: EnhancedSitemapItem[] = [
          /* Раскомментируйте и адаптируйте этот код, если у вас есть видео контент
          {
            url: `${baseUrl}/videos/company-presentation`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
            videos: [
              {
                thumbnail_loc: `${baseUrl}/images/video-thumbnails/company-presentation.jpg`,
                title: 'Презентация компании RoyalTransfer',
                description: 'Видеопрезентация трансферной компании RoyalTransfer из Калининграда',
                content_loc: `${baseUrl}/videos/company-presentation.mp4`,
                player_loc: `${baseUrl}/video-player?id=company-presentation`,
                duration: 180, // в секундах
                publication_date: '2023-08-15',
                tags: ['трансфер', 'калининград', 'европа', 'презентация']
              }
            ]
          }
          */
        ]

        // Закрываем соединение с базой данных
        await prisma.$disconnect()

        // Объединяем все URL в один массив и возвращаем
        return [...staticRoutes, ...blogEntries, ...galleryEntries, ...routeEntries, ...videoEntries]
      } catch (error) {
        console.error('Ошибка при получении данных для sitemap:', error)
        // В случае ошибки закрываем соединение и возвращаем только статические маршруты
        await prisma.$disconnect()
        return staticRoutes
      }
    } else {
      // Если prisma не инициализирован, возвращаем только статические маршруты
      console.warn('Prisma не был инициализирован, возвращаем только статические маршруты')
      return staticRoutes
    }
  } catch (error) {
    console.error('Критическая ошибка при генерации sitemap:', error)

    // Если была ошибка при работе с prisma, закрываем соединение если оно есть
    if (prisma) {
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Ошибка при закрытии соединения с базой данных:', disconnectError)
      }
    }

    // Возвращаем только статические маршруты
    return [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8
      }
    ]
  }
}
