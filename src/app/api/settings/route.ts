import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение настроек сайта
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst({
      where: { id: 1 }
    })

    // Если настроек нет, создаем со значениями по умолчанию
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 1,
          phone: "+7 (900) 000-00-00",
          email: "info@royaltransfer.ru",
          address: "г. Калининград, ул. Примерная, д. 123",
          workingHours: "Пн-Вс: 24/7",
          companyName: "RoyalTransfer",
          companyDesc: "Комфортные трансферы из Калининграда в города Европы. Безопасность, комфорт и пунктуальность.",
          instagramLink: "#",
          telegramLink: "#",
          whatsappLink: "#",
          googleMapsApiKey: null // Добавляем поле для API ключа Google Maps
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Не удалось получить настройки' }, { status: 500 })
  }
}

// Обновление настроек сайта
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Проверка на наличие хотя бы одного поля для обновления
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Необходимо указать хотя бы одно поле для обновления' }, { status: 400 })
    }

    // Валидация полей логотипов и API ключа
    const updatedData = { ...body };

    // Проверка на пустые строки и преобразование их в null
    if (updatedData.headerLogoUrl !== undefined && (!updatedData.headerLogoUrl || updatedData.headerLogoUrl.trim() === '')) {
      updatedData.headerLogoUrl = null;
    }

    if (updatedData.footerLogoUrl !== undefined && (!updatedData.footerLogoUrl || updatedData.footerLogoUrl.trim() === '')) {
      updatedData.footerLogoUrl = null;
    }

    if (updatedData.googleMapsApiKey !== undefined && (!updatedData.googleMapsApiKey || updatedData.googleMapsApiKey.trim() === '')) {
      updatedData.googleMapsApiKey = null;
    }

    // Проверяем, существуют ли настройки
    let settings = await prisma.siteSettings.findFirst({
      where: { id: 1 }
    })

    if (settings) {
      // Обновляем существующие настройки
      settings = await prisma.siteSettings.update({
        where: { id: 1 },
        data: updatedData
      })
    } else {
      // Создаем новые настройки с объединением значений по умолчанию и переданных настроек
      const defaultSettings = {
        id: 1,
        phone: "+7 (900) 000-00-00",
        email: "info@royaltransfer.ru",
        address: "г. Калининград, ул. Примерная, д. 123",
        workingHours: "Пн-Вс: 24/7",
        companyName: "RoyalTransfer",
        companyDesc: "Комфортные трансферы из Калининграда в города Европы. Безопасность, комфорт и пунктуальность.",
        instagramLink: "#",
        telegramLink: "#",
        whatsappLink: "#",
        googleMapsApiKey: null // Добавляем поле для API ключа Google Maps
      }

      settings = await prisma.siteSettings.create({
        data: { ...defaultSettings, ...updatedData }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Не удалось обновить настройки' }, { status: 500 })
  }
}
