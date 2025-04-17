import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Загрузка переменных окружения
dotenv.config()

const prisma = new PrismaClient()

// Получение списка заявок на трансфер
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Формируем условие поиска
    let where = {}
    if (status) {
      where = { status }
    }

    // Получаем общее количество заявок
    const totalCount = await prisma.transferRequest.count({ where })

    // Получаем заявки с пагинацией и сортировкой
    const transferRequests = await prisma.transferRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        vehicle: true
      }
    })

    return NextResponse.json({
      transferRequests,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transfer requests:', error)
    return NextResponse.json(
      { error: 'Не удалось получить заявки на трансфер' },
      { status: 500 }
    )
  }
}

// Создание новой заявки на трансфер
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Валидация основных полей
    if (!body.customerName || !body.customerPhone || !body.date) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Преобразование даты из строки в объект Date, если необходимо
    const requestData = {
      ...body,
      date: new Date(body.date),
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
      status: 'new',
      updatedAt: new Date()
    }

    // Создаем новую заявку
    const transferRequest = await prisma.transferRequest.create({
      data: requestData,
    })

    // Формируем ответ клиенту
    const response = NextResponse.json({
      success: true,
      transferRequest
    })

    return response
  } catch (error) {
    console.error('Error creating transfer request:', error)
    return NextResponse.json(
      { error: 'Не удалось создать заявку на трансфер' },
      { status: 500 }
    )
  }
}

// Обновление заявки на трансфер
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Проверяем наличие ID
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID заявки не указан' },
        { status: 400 }
      )
    }

    // Получаем текущую заявку
    const existingRequest = await prisma.transferRequest.findUnique({
      where: { id: body.id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    // Подготавливаем данные для обновления
    const updateData = {
      ...body,
      date: body.date ? new Date(body.date) : existingRequest.date,
      returnDate: body.returnDate ? new Date(body.returnDate) : existingRequest.returnDate,
      updatedAt: new Date()
    }

    // Удаляем id из данных обновления
    delete updateData.id

    // Обновляем заявку
    const updatedRequest = await prisma.transferRequest.update({
      where: { id: body.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      transferRequest: updatedRequest
    })
  } catch (error) {
    console.error('Error updating transfer request:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить заявку на трансфер' },
      { status: 500 }
    )
  }
}

// Удаление заявки на трансфер
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = parseInt(url.searchParams.get('id') || '0')

    if (!id) {
      return NextResponse.json(
        { error: 'ID заявки не указан' },
        { status: 400 }
      )
    }

    // Проверяем существование заявки
    const existingRequest = await prisma.transferRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    // Удаляем заявку
    await prisma.transferRequest.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting transfer request:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить заявку на трансфер' },
      { status: 500 }
    )
  }
}
