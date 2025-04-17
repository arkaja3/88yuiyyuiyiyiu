import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer'; // Импортируем nodemailer

// Создаем инстанс Prisma Client (лучше делать это глобально, если возможно, чтобы избежать создания множества соединений)
// См. документацию Prisma по интеграции с Next.js для лучших практик:
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
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

// --- Функция POST обновлена для отправки EMAIL ---
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
    // Убираем updatedAt, Prisma может управлять этим автоматически, если настроено в схеме
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
    try {
      // Проверяем наличие необходимых переменных окружения для email
      if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.CONTACT_FORM_EMAIL) {
          console.error(`Ошибка конфигурации: Не все SMTP переменные окружения установлены для заявки ${savedContactRequest.id}. Email не будет отправлен.`);
          // НЕ прерываем выполнение, так как заявка уже сохранена
      } else {
          // Настройка транспортера Nodemailer
          const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT, 10), // Преобразуем порт в число
              secure: process.env.SMTP_SECURE === 'true', // Преобразуем 'true'/'false' в boolean
              auth: {
                  user: process.env.SMTP_USER, // Ваш логин SMTP
                  pass: process.env.SMTP_PASSWORD, // Ваш пароль SMTP
              },
              // Можно добавить для отладки проблем с TLS/SSL на некоторых хостингах
              // tls: {
              //     rejectUnauthorized: false
              // }
          });

          // Настройка опций письма
          const mailOptions = {
              from: `"Royal Transfer Сайт" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`, // Адрес отправителя (из .env или логин)
              to: process.env.CONTACT_FORM_EMAIL, // Адрес получателя уведомления (из .env)
              replyTo: email, // Email клиента для удобного ответа
              subject: `Новая заявка с сайта Royal Transfer от ${name}`, // Тема письма
              text: `Получена новая заявка с сайта:\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone || 'Не указан'}\nСообщение:\n${message}\n\nID заявки: ${savedContactRequest.id}`, // Текстовая версия
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
              `, // HTML-версия письма
          };

          // Отправка письма
          await transporter.sendMail(mailOptions);
          console.log(`Email уведомление для заявки ${savedContactRequest.id} успешно отправлено на ${mailOptions.to}`);
      }

    } catch (mailError) {
      // Логируем ошибку отправки email, но НЕ прерываем успешный ответ клиенту
      console.error(`Ошибка при отправке email для заявки ${savedContactRequest.id}:`, mailError);
      // Здесь можно добавить логирование в систему мониторинга (Sentry и т.п.)
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

// --- НЕ ЗАБУДЬТЕ: Настроить файл .env или .env.local ---
/*
Пример содержимого файла `.env.local` (добавьте его в `.gitignore`!):

# Данные для подключения к БД (если они у вас здесь)
# DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Настройки SMTP для отправки почты через Reg.ru (УТОЧНИТЕ У REG.RU!)
SMTP_HOST=mail.hosting.reg.ru
SMTP_PORT=465
SMTP_SECURE=true # Используйте 'true' или 'false' как строку
SMTP_USER=info@royaltransfer.org
SMTP_PASSWORD=ВАШ_АКТУАЛЬНЫЙ_ПАРОЛЬ_ОТ_ПОЧТЫ_info@royaltransfer.org
SMTP_FROM=info@royaltransfer.org # Адрес, который будет указан в поле "От"
CONTACT_FORM_EMAIL=info@royaltransfer.org # Адрес(а), НА который будут приходить уведомления

# Можно указать несколько адресов через запятую для CONTACT_FORM_EMAIL, если nodemailer их поддерживает в таком формате
# CONTACT_FORM_EMAIL=email1@example.com, email2@example.com

*/