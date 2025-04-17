import { NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://royaltransfer.org'

export async function GET() {
  try {
    const now = new Date().toISOString()

    // Формируем XML для индекса карты сайта
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

    // Добавляем основную карту сайта
    xml += `  <sitemap>\n`
    xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += `  </sitemap>\n`

    // Добавляем карту блога
    xml += `  <sitemap>\n`
    xml += `    <loc>${baseUrl}/api/sitemaps/blog</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += `  </sitemap>\n`

    // Добавляем карту галереи
    xml += `  <sitemap>\n`
    xml += `    <loc>${baseUrl}/api/sitemaps/gallery</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += `  </sitemap>\n`

    // Добавляем карту маршрутов
    xml += `  <sitemap>\n`
    xml += `    <loc>${baseUrl}/api/sitemaps/routes</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += `  </sitemap>\n`

    // Закрываем XML
    xml += `</sitemapindex>`

    // Возвращаем XML в ответе
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // кэшируем на 24 часа
      },
    })
  } catch (error) {
    console.error('Ошибка при создании индекса sitemap:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании индекса sitemap' },
      { status: 500 }
    )
  }
}
