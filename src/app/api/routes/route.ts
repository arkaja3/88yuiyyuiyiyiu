import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение всех маршрутов
export async function GET() {
  try {
    // Получаем все записи из таблицы Route
    const routes = await prisma.route.findMany({
      orderBy: {
        id: 'asc'
      }
    })

    return NextResponse.json({ routes })
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json({ error: 'Не удалось получить данные о маршрутах' }, { status: 500 })
  }
}

// Создание нового маршрута
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Валидация данных
    if (!body.originCity || !body.destinationCity || body.distance === undefined || !body.estimatedTime) {
      return NextResponse.json(
        { error: 'Необходимо указать originCity, destinationCity, distance и estimatedTime' },
        { status: 400 }
      )
    }

    // Создаем новый маршрут
    const route = await prisma.route.create({
      data: {
        originCity: body.originCity,
        destinationCity: body.destinationCity,
        distance: Number(body.distance),
        estimatedTime: body.estimatedTime,
        priceComfort: Number(body.priceComfort || 0),
        priceBusiness: Number(body.priceBusiness || 0),
        priceMinivan: Number(body.priceMinivan || 0),
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        popularityRating: Number(body.popularityRating || 1),
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json({ route })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json({ error: 'Не удалось создать маршрут' }, { status: 500 })
  }
}

// Обновление существующего маршрута
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Валидация данных
    if (!body.id) {
      return NextResponse.json({ error: 'Необходимо указать id маршрута' }, { status: 400 })
    }

    // Обновляем маршрут
    const route = await prisma.route.update({
      where: { id: Number(body.id) },
      data: {
        originCity: body.originCity || undefined,
        destinationCity: body.destinationCity || undefined,
        distance: body.distance !== undefined ? Number(body.distance) : undefined,
        estimatedTime: body.estimatedTime || undefined,
        priceComfort: body.priceComfort !== undefined ? Number(body.priceComfort) : undefined,
        priceBusiness: body.priceBusiness !== undefined ? Number(body.priceBusiness) : undefined,
        priceMinivan: body.priceMinivan !== undefined ? Number(body.priceMinivan) : undefined,
        description: body.description !== undefined ? body.description : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        popularityRating: body.popularityRating !== undefined ? Number(body.popularityRating) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined
      }
    })

    return NextResponse.json({ route })
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json({ error: 'Не удалось обновить маршрут' }, { status: 500 })
  }
}

// Удаление маршрута
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Необходимо указать id маршрута' }, { status: 400 })
    }

    // Удаляем маршрут
    await prisma.route.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json({ error: 'Не удалось удалить маршрут' }, { status: 500 })
  }
}
