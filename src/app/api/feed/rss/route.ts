import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://royaltransfer.org'

export async function GET() {
  try {
    // Создаем экземпляр клиента Prisma
    const prisma = new PrismaClient()
    await prisma.$connect()

    // Получаем все опубликованные посты блога
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 15, // Последние 15 постов
    })

    // Формируем XML RSS фид
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<rss version="2.0"
             xmlns:content="http://purl.org/rss/1.0/modules/content/"
             xmlns:atom="http://www.w3.org/2005/Atom">\n`
    xml += `<channel>\n`
    xml += `<title>RoyalTransfer - Блог о трансферах и путешествиях</title>\n`
    xml += `<link>${baseUrl}/blog</link>\n`
    xml += `<description>Статьи о путешествиях, трансферах и интересных местах от RoyalTransfer</description>\n`
    xml += `<language>ru-ru</language>\n`
    xml += `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`
    xml += `<atom:link href="${baseUrl}/api/feed/rss" rel="self" type="application/rss+xml" />\n`

    // Добавляем каждый пост
    posts.forEach((post) => {
      const pubDate = post.publishedAt || post.createdAt
      const imageUrl = post.imageUrl || `${baseUrl}/images/default-blog.jpg`

      xml += `<item>\n`
      xml += `  <title>${escapeXml(post.title)}</title>\n`
      xml += `  <link>${baseUrl}/blog/${post.slug}</link>\n`
      xml += `  <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>\n`
      xml += `  <pubDate>${new Date(pubDate).toUTCString()}</pubDate>\n`
      xml += `  <description>${escapeXml(post.excerpt || '')}</description>\n`
      xml += `  <content:encoded><![CDATA[`

      // Добавляем изображение в начало контента
      xml += `<div><img src="${imageUrl}" alt="${escapeXml(post.title)}" width="800" /></div>`
      xml += post.content || ''

      xml += `]]></content:encoded>\n`
      xml += `  <enclosure url="${imageUrl}" type="image/jpeg" length="0" />\n`
      xml += `</item>\n`
    })

    xml += `</channel>\n`
    xml += `</rss>`

    // Закрываем соединение с базой данных
    await prisma.$disconnect()

    // Возвращаем XML в ответе
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // кэшируем на 30 минут
      },
    })
  } catch (error) {
    console.error('Ошибка при создании RSS фида:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании RSS фида' },
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
