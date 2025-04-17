import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://royaltransfer.org'

type SitemapParams = {
  params: {
    type: string
  }
}

export async function GET(request: NextRequest, { params }: SitemapParams) {
  const { type } = params

  try {
    const prisma = new PrismaClient()
    await prisma.$connect()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`
    xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`

    // В зависимости от запрошенного типа sitemap, генерируем соответствующие URL
    switch (type) {
      case 'blog':
        // Получаем все опубликованные посты блога
        const posts = await prisma.blogPost.findMany({
          where: {
            isPublished: true
          },
          select: {
            slug: true,
            updatedAt: true,
            title: true,
            imageUrl: true
          }
        })

        // Добавляем URL для каждого поста блога
        posts.forEach(post => {
          const url = `${baseUrl}/blog/${post.slug}`
          const lastmod = post.updatedAt.toISOString()
          const imageUrl = post.imageUrl || `${baseUrl}/images/default-blog.jpg`
          const title = post.title

          xml += `  <url>\n`
          xml += `    <loc>${url}</loc>\n`
          xml += `    <lastmod>${lastmod}</lastmod>\n`
          xml += `    <changefreq>weekly</changefreq>\n`
          xml += `    <priority>0.7</priority>\n`

          // Добавляем информацию об изображении для блога
          xml += `    <image:image>\n`
          xml += `      <image:loc>${imageUrl}</image:loc>\n`
          xml += `      <image:title>${escapeXml(title)}</image:title>\n`
          xml += `      <image:caption>${escapeXml(title)} - Блог RoyalTransfer</image:caption>\n`
          xml += `    </image:image>\n`
          xml += `  </url>\n`
        })
        break

      case 'gallery':
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

        // Добавляем URL для каждой галереи
        galleries.forEach(gallery => {
          const url = `${baseUrl}/gallery/${gallery.slug}`
          const lastmod = gallery.updatedAt.toISOString()

          xml += `  <url>\n`
          xml += `    <loc>${url}</loc>\n`
          xml += `    <lastmod>${lastmod}</lastmod>\n`
          xml += `    <changefreq>monthly</changefreq>\n`
          xml += `    <priority>0.6</priority>\n`

          // Добавляем информацию о каждом изображении в галерее
          gallery.photos.forEach(photo => {
            xml += `    <image:image>\n`
            xml += `      <image:loc>${photo.url}</image:loc>\n`
            xml += `      <image:title>${escapeXml(photo.title || gallery.title)}</image:title>\n`
            xml += `      <image:caption>${escapeXml(photo.description || `Фотография из галереи "${gallery.title}"`)}</image:caption>\n`
            xml += `    </image:image>\n`
          })

          xml += `  </url>\n`
        })
        break

      case 'routes':
        // Получаем все маршруты
        const routes = await prisma.route.findMany({
          select: {
            id: true,
            updatedAt: true,
            originCity: true,       // Исправлено с fromLocation на originCity
            destinationCity: true,  // Исправлено с toLocation на destinationCity
            description: true
          }
        })

        // Добавляем URL для каждого маршрута
        routes.forEach(route => {
          const url = `${baseUrl}/routes/${route.id}`
          const lastmod = route.updatedAt.toISOString()
          const title = `${route.originCity} - ${route.destinationCity}`  // Исправлено на правильные поля

          xml += `  <url>\n`
          xml += `    <loc>${url}</loc>\n`
          xml += `    <lastmod>${lastmod}</lastmod>\n`
          xml += `    <changefreq>monthly</changefreq>\n`
          xml += `    <priority>0.5</priority>\n`

          // Добавляем схематическое изображение маршрута, если оно есть
          xml += `    <image:image>\n`
          xml += `      <image:loc>${baseUrl}/images/routes/route-${route.id}.jpg</image:loc>\n`
          xml += `      <image:title>${escapeXml(title)}</image:title>\n`
          xml += `      <image:caption>${escapeXml(`Маршрут ${title}: ${route.description || 'комфортный трансфер'}`)}</image:caption>\n`
          xml += `    </image:image>\n`
          xml += `  </url>\n`
        })
        break

      default:
        // Если запрошен неизвестный тип sitemap, возвращаем 404
        await prisma.$disconnect()
        return NextResponse.json(
          { error: 'Неизвестный тип sitemap' },
          { status: 404 }
        )
    }

    xml += `</urlset>`

    // Закрываем соединение с базой данных
    await prisma.$disconnect()

    // Возвращаем XML в ответе
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // кэшируем на 1 час
      },
    })
  } catch (error) {
    console.error(`Ошибка при создании sitemap для ${type}:`, error)
    return NextResponse.json(
      { error: 'Ошибка при создании sitemap' },
      { status: 500 }
    )
  }
}

// Функция для экранирования XML-специальных символов
function escapeXml(unsafe: string): string {
  return unsafe
    ? unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    : '';
}
