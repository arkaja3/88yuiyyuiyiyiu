import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение всех транспортных средств
export async function GET() {
  try {
    // Получаем все записи из таблицы Vehicle
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        id: 'asc'
      }
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Не удалось получить данные о транспортных средствах' }, { status: 500 })
  }
}

// Создание нового транспортного средства
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Валидация данных
    if (!body.class || !body.brand || !body.model || !body.year || !body.seats) {
      return NextResponse.json(
        { error: 'Необходимо указать class, brand, model, year и seats' },
        { status: 400 }
      )
    }

    // Создаем новое транспортное средство
    const vehicle = await prisma.vehicle.create({
      data: {
        class: body.class,
        brand: body.brand,
        model: body.model,
        year: Number(body.year),
        seats: Number(body.seats),
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        amenities: body.amenities || null,
        price: body.price !== undefined ? body.price : null,
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Не удалось создать транспортное средство' }, { status: 500 })
  }
}

// Обновление существующего транспортного средства
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Валидация данных
    if (!body.id) {
      return NextResponse.json({ error: 'Необходимо указать id транспортного средства' }, { status: 400 })
    }

    // Обновляем транспортное средство
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(body.id) },
      data: {
        class: body.class || undefined,
        brand: body.brand || undefined,
        model: body.model || undefined,
        year: body.year !== undefined ? Number(body.year) : undefined,
        seats: body.seats !== undefined ? Number(body.seats) : undefined,
        description: body.description !== undefined ? body.description : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        amenities: body.amenities !== undefined ? body.amenities : undefined,
        price: body.price !== undefined ? body.price : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined
      }
    })

    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Не удалось обновить транспортное средство' }, { status: 500 })
  }
}

// Удаление транспортного средства
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Необходимо указать id транспортного средства' }, { status: 400 })
    }

    // Удаляем транспортное средство
    await prisma.vehicle.delete({
      where: { id: Number(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Не удалось удалить транспортное средство' }, { status: 500 })
  }
}
