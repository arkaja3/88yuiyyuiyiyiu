import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Создаём новый экземпляр Prisma для каждого запроса, чтобы избежать кеширования
const prisma = new PrismaClient()

// Добавляем заголовок экспорта для отключения кеширования
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Получение опубликованных статей для главной страницы
export async function GET() {
  try {
    console.log('Fetching featured blog posts for home page');

    // Получаем только опубликованные статьи, сортируем по дате публикации
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 3 // Ограничиваем количество записей для главной страницы
    })

    console.log(`Found ${blogPosts.length} published blog posts`);

    // Добавляем заголовки для предотвращения кеширования
    return new NextResponse(JSON.stringify({ blogPosts }), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error fetching featured blog posts:', error)
    return NextResponse.json({ error: 'Не удалось получить статьи блога' }, { status: 500 })
  } finally {
    // Отключаем соединение с базой данных после завершения запроса
    await prisma.$disconnect()
  }
}
