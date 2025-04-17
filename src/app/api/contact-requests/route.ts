import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import emailService from '@/lib/email-service'; // Импортируем сервис электронной почты

// Создаем инстанс Prisma Client
const prisma = new PrismaClient();

// --- Функция GET остается без изменений ---
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let where: any = {}; // Используем 'any' для простоты, можно типизировать строже
    if (status) {
      where = { status };
    }

    const totalCount = await prisma.contactRequest.count({ where });
    const contactRequests = await prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      contactRequests,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return NextResponse.json(
      { error: 'Не удалось получить заявки из формы обратной связи' },
      { status: 500 }
    );
  }
}

// --- Обновленная функция POST с использованием нового email-сервиса ---
export async function POST(request: Request) {
  let savedContactRequest; // Объявим переменную для доступа в блоке email

  try {
    const body = await request.json();
    const { name, email, phone, message } = body; // Извлекаем поля

    // Улучшенная валидация - проверяем обязательные поля
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Поля "Имя", "Email" и "Сообщение" обязательны для заполнения.' },
        { status: 400 }
      );
    }
    // Можно добавить более строгую валидацию формата email и phone здесь

    // Подготавливаем данные для создания в БД
    const requestData = {
      name,
      email,
      phone: phone || null, // Сохраняем null, если телефон не указан
      message,
      status: 'new', // Устанавливаем начальный статус
    };

    // 1. Создаем новую заявку в базе данных
    savedContactRequest = await prisma.contactRequest.create({
      data: requestData,
    });
    console.log(`Заявка ${savedContactRequest.id} успешно сохранена в БД.`);

    // 2. Отправляем Email уведомление ПОСЛЕ успешного сохранения в БД
    if (emailService.isConfigured() && process.env.CONTACT_FORM_EMAIL) {
      try {
        const emailSent = await emailService.sendEmail({
          to: process.env.CONTACT_FORM_EMAIL,
          subject: `Новая заявка с сайта Royal Transfer от ${name}`,
          replyTo: email, // Email клиента для удобного ответа
          text: `Получена новая заявка с сайта:

Имя: ${name}
Email: ${email}
Телефон: ${phone || 'Не указан'}
Сообщение:
${message}

ID заявки: ${savedContactRequest.id}`,
          html: `
            <h2>Новая заявка с сайта Royal Transfer</h2>
            <p><strong>ID заявки:</strong> ${savedContactRequest.id}</p>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Телефон:</strong> ${phone ? `<a href="tel:${phone.replace(/[\s()-]/g, '')}">${phone}</a>` : 'Не указан'}</p>
            <p><strong>Сообщение:</strong></p>
            <blockquote style="margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; background-color: #f9f9f9; white-space: pre-wrap;">${message}</blockquote>
            <hr>
            <p><small>Это автоматическое уведомление. Заявка сохранена в базе данных.</small></p>
          `,
        });

        if (emailSent) {
          console.log(`Email уведомление для заявки ${savedContactRequest.id} успешно отправлено`)
        } else {
          console.error(`Ошибка при отправке email для заявки ${savedContactRequest.id}`)
        }
      } catch (mailError) {
        // Логируем ошибку отправки email, но НЕ прерываем успешный ответ клиенту
        console.error(`Ошибка при отправке email для заявки ${savedContactRequest.id}:`, mailError);
      }
    } else {
      console.warn(`Email-сервис не настроен или отсутствует CONTACT_FORM_EMAIL для заявки ${savedContactRequest.id}`)
    }

    // 3. Возвращаем успешный ответ клиенту (фронтенду)
    return NextResponse.json({
      success: true,
      contactRequest: savedContactRequest, // Возвращаем созданную заявку
    });

  } catch (error) {
    // Обрабатываем ошибки, возникшие ДО или ВО ВРЕМЯ сохранения в БД
    console.error('Error creating contact request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Не удалось создать заявку из формы обратной связи';
    // Если ошибка произошла после сохранения, но до отправки email, savedContactRequest может быть определен
    // В этом случае можно добавить ID в лог ошибки
    const requestId = savedContactRequest?.id ? ` (Заявка ID: ${savedContactRequest.id})` : '';
    return NextResponse.json(
      { error: `${errorMessage}${requestId}` },
      { status: 500 }
    );
  } finally {
      // Рассмотрите возможность отключения клиента Prisma, если он не глобальный
      // await prisma.$disconnect();
  }
}

// --- Функции PUT и DELETE остаются без изменений ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID заявки не указан' }, { status: 400 });
    }

    const existingRequest = await prisma.contactRequest.findUnique({ where: { id: body.id } });
    if (!existingRequest) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    const updateData = { ...body, updatedAt: new Date() };
    delete updateData.id; // Не обновляем ID

    const updatedRequest = await prisma.contactRequest.update({
      where: { id: body.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, contactRequest: updatedRequest });
  } catch (error) {
    console.error('Error updating contact request:', error);
    return NextResponse.json(
      { error: 'Не удалось обновить заявку из формы обратной связи' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    // Лучше получать ID из параметров пути или тела запроса для DELETE
    const idParam = url.searchParams.get('id');
    if (!idParam) {
        return NextResponse.json({ error: 'ID заявки не указан в параметрах' }, { status: 400 });
    }
    const id = parseInt(idParam, 10);
     if (isNaN(id)) {
        return NextResponse.json({ error: 'Некорректный ID заявки' }, { status: 400 });
    }

    const existingRequest = await prisma.contactRequest.findUnique({ where: { id } });
    if (!existingRequest) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    await prisma.contactRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact request:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить заявку из формы обратной связи' },
      { status: 500 }
    );
  }
}
