import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://royaltransfer.org'

export async function GET() {
  try {
    // Создаем экземпляр клиента Prisma
    const prisma = new PrismaClient()
    await prisma.$connect()

    // Получаем все трансферы
    const transfers = await prisma.transfer.findMany({
      where: {
        status: 'pending', // Заменяем isActive на status, так как isActive нет в модели Transfer
      },
      include: {
        vehicle: true, // Правильное название поля для связи с Vehicle
        route: true, // Включаем информацию о маршруте
      },
    })

    // Формируем XML фид для Google Merchant Center
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`
    xml += `<channel>\n`
    xml += `<title>RoyalTransfer - Трансферы из Калининграда в Европу</title>\n`
    xml += `<link>${baseUrl}</link>\n`
    xml += `<description>Комфортные трансферы из Калининграда в города Европы</description>\n`

    // Добавляем каждый трансфер как товар
    transfers.forEach((transfer) => {
      const price = transfer.price || 0
      const vehicle = transfer.vehicle?.brand || 'Комфортный автомобиль'
      const fromLocation = transfer.origin || transfer.route?.originCity || ''
      const toLocation = transfer.destination || transfer.route?.destinationCity || ''

      xml += `<item>\n`
      xml += `  <g:id>transfer-${transfer.id}</g:id>\n`
      xml += `  <g:title>Трансфер ${escapeXml(fromLocation)} - ${escapeXml(toLocation)}</g:title>\n`
      xml += `  <g:description>Комфортный трансфер из ${escapeXml(fromLocation)} в ${escapeXml(toLocation)} на ${escapeXml(vehicle)}. ${escapeXml(transfer.comments || '')}</g:description>\n`
      xml += `  <g:link>${baseUrl}/transfer/${transfer.id}</g:link>\n`
      xml += `  <g:image_link>${baseUrl}/images/logo.png</g:image_link>\n`
      xml += `  <g:availability>in stock</g:availability>\n`
      xml += `  <g:price>${price} RUB</g:price>\n`
      xml += `  <g:brand>RoyalTransfer</g:brand>\n`
      xml += `  <g:condition>new</g:condition>\n`
      xml += `  <g:google_product_category>3</g:google_product_category>\n` // 3 - категория "Путешествия"
      xml += `  <g:product_type>Passenger Transportation Service</g:product_type>\n`
      xml += `</item>\n`
    })

    xml += `</channel>\n`
    xml += `</rss>`

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
    console.error('Ошибка при создании фида Google Merchant:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании фида' },
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
