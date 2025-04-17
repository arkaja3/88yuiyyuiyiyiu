import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import emailService from '@/lib/email-service'

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
  let savedTransferRequest; // Объявляем переменную для использования в блоке отправки email

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
    savedTransferRequest = await prisma.transferRequest.create({
      data: requestData,
    })

    console.log(`Заявка на трансфер ${savedTransferRequest.id} успешно сохранена в БД.`)

    // Формирование читаемой информации о заказе
    const originCity = body.originCity || 'Не указан'
    const destinationCity = body.destinationCity || 'Не указан'
    const vehicleClass = body.vehicleClass || 'Не указан'
    const paymentMethod = (() => {
      switch(body.paymentMethod) {
        case 'cash': return 'Наличными'
        case 'card': return 'Банковской картой'
        case 'online': return 'Онлайн оплата'
        default: return body.paymentMethod || 'Не указан'
      }
    })()

    const formattedDate = body.date ? new Date(body.date).toLocaleString('ru-RU', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Не указана'

    const returnTransferInfo = body.returnTransfer ?
      `Обратный трансфер: Да\nДата и время обратного трансфера: ${
        body.returnDate ? new Date(body.returnDate).toLocaleString('ru-RU', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Не указана'
      }` : 'Обратный трансфер: Нет'

    // Отправляем Email уведомление ПОСЛЕ успешного сохранения в БД
    if (emailService.isConfigured() && process.env.TRANSFER_REQUEST_EMAIL) {
      try {
        const emailSent = await emailService.sendEmail({
          to: process.env.TRANSFER_REQUEST_EMAIL,
          subject: `Новый заказ трансфера #${savedTransferRequest.id} от ${body.customerName}`,
          text: `Получен новый заказ трансфера с сайта:\n\n
Информация о клиенте:
Имя: ${body.customerName}
Телефон: ${body.customerPhone}

Информация о трансфере:
Откуда: ${originCity}, ${body.originAddress || 'адрес не указан'}
Куда: ${destinationCity}, ${body.tellDriver ? 'клиент скажет водителю' : (body.destinationAddress || 'адрес не указан')}
Дата и время: ${formattedDate}
Класс автомобиля: ${vehicleClass}
Способ оплаты: ${paymentMethod}
${returnTransferInfo}
${body.comments ? `\nКомментарий клиента:\n${body.comments}` : ''}

ID заявки: ${savedTransferRequest.id}`,
          html: `
            <h2>Новый заказ трансфера с сайта Royal Transfer</h2>
            <p><strong>ID заказа:</strong> ${savedTransferRequest.id}</p>
            <h3>Информация о клиенте:</h3>
            <p><strong>Имя:</strong> ${body.customerName}</p>
            <p><strong>Телефон:</strong> <a href="tel:${body.customerPhone.replace(/[\s()-]/g, '')}">${body.customerPhone}</a></p>

            <h3>Информация о трансфере:</h3>
            <p><strong>Откуда:</strong> ${originCity}, ${body.originAddress || 'адрес не указан'}</p>
            <p><strong>Куда:</strong> ${destinationCity}, ${body.tellDriver ? '<em>клиент скажет водителю</em>' : (body.destinationAddress || 'адрес не указан')}</p>
            <p><strong>Дата и время:</strong> ${formattedDate}</p>
            <p><strong>Класс автомобиля:</strong> ${vehicleClass}</p>
            <p><strong>Способ оплаты:</strong> ${paymentMethod}</p>
            <p><strong>Обратный трансфер:</strong> ${body.returnTransfer ? 'Да' : 'Нет'}</p>
            ${body.returnTransfer ? `<p><strong>Дата и время обратного трансфера:</strong> ${
              body.returnDate ? new Date(body.returnDate).toLocaleString('ru-RU', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              }) : 'Не указана'
            }</p>` : ''}

            ${body.comments ? `
            <h3>Комментарий клиента:</h3>
            <blockquote style="margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; background-color: #f9f9f9; white-space: pre-wrap;">${body.comments}</blockquote>
            ` : ''}

            <hr>
            <p><small>Это автоматическое уведомление. Заказ трансфера сохранен в базе данных.</small></p>
          `,
        });

        if (emailSent) {
          console.log(`Email уведомление для заказа трансфера ${savedTransferRequest.id} успешно отправлено`)
        } else {
          console.error(`Ошибка при отправке email для заказа трансфера ${savedTransferRequest.id}`)
        }
      } catch (mailError) {
        // Логируем ошибку отправки email, но НЕ прерываем успешный ответ клиенту
        console.error(`Ошибка при отправке email для заказа трансфера ${savedTransferRequest.id}:`, mailError)
      }
    } else {
      console.warn(`Email-сервис не настроен или отсутствует TRANSFER_REQUEST_EMAIL для заявки ${savedTransferRequest.id}`)
    }

    // Формируем ответ клиенту
    const response = NextResponse.json({
      success: true,
      transferRequest: savedTransferRequest
    })

    return response
  } catch (error) {
    console.error('Error creating transfer request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Не удалось создать заявку на трансфер'
    const requestId = savedTransferRequest?.id ? ` (Заказ ID: ${savedTransferRequest.id})` : ''
    return NextResponse.json(
      { error: `${errorMessage}${requestId}` },
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
