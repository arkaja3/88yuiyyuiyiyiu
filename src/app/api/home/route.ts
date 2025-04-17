import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение настроек домашней страницы
export async function GET() {
  try {
    let homeSettings = await prisma.homeSettings.findFirst({
      where: { id: 1 }
    })

    // Если настроек нет, создаем со значениями по умолчанию
    if (!homeSettings) {
      homeSettings = await prisma.homeSettings.create({
        data: {
          id: 1,
          title: "Комфортные трансферы из Калининграда в Европу",
          subtitle: "Безопасные и удобные поездки в города Польши, Германии, Литвы и других стран Европы",
          backgroundImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          feature1Title: "Любые направления",
          feature1Text: "Поездки в основные города Европы по фиксированным ценам",
          feature1Icon: "MapPin",
          feature2Title: "Круглосуточно",
          feature2Text: "Работаем 24/7, включая праздники и выходные дни",
          feature2Icon: "Clock",
          feature3Title: "Гарантия качества",
          feature3Text: "Комфортные автомобили и опытные водители",
          feature3Icon: "Check"
        }
      })
    }

    return NextResponse.json({ homeSettings })
  } catch (error) {
    console.error('Error fetching home settings:', error)
    return NextResponse.json({ error: 'Не удалось получить настройки домашней страницы' }, { status: 500 })
  }
}

// Обновление настроек домашней страницы
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Проверка на наличие хотя бы одного поля для обновления
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Необходимо указать хотя бы одно поле для обновления' }, { status: 400 })
    }

    // Проверяем, существуют ли настройки
    let homeSettings = await prisma.homeSettings.findFirst({
      where: { id: 1 }
    })

    if (homeSettings) {
      // Обновляем существующие настройки
      homeSettings = await prisma.homeSettings.update({
        where: { id: 1 },
        data: body
      })
    } else {
      // Создаем новые настройки с объединением значений по умолчанию и переданных настроек
      const defaultSettings = {
        id: 1,
        title: "Комфортные трансферы из Калининграда в Европу",
        subtitle: "Безопасные и удобные поездки в города Польши, Германии, Литвы и других стран Европы",
        backgroundImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        feature1Title: "Любые направления",
        feature1Text: "Поездки в основные города Европы по фиксированным ценам",
        feature1Icon: "MapPin",
        feature2Title: "Круглосуточно",
        feature2Text: "Работаем 24/7, включая праздники и выходные дни",
        feature2Icon: "Clock",
        feature3Title: "Гарантия качества",
        feature3Text: "Комфортные автомобили и опытные водители",
        feature3Icon: "Check"
      }

      homeSettings = await prisma.homeSettings.create({
        data: { ...defaultSettings, ...body }
      })
    }

    return NextResponse.json({ homeSettings })
  } catch (error) {
    console.error('Error updating home settings:', error)
    return NextResponse.json({ error: 'Не удалось обновить настройки домашней страницы' }, { status: 500 })
  }
}
