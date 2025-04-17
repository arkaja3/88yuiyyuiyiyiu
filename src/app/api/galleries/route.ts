import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Схема валидации для создания галереи
const createGallerySchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug должен содержать только строчные буквы, цифры и дефисы')
    .min(3, 'Slug должен содержать минимум 3 символа'),
  isPublished: z.boolean().optional(),
});

// GET /api/galleries - получение всех галерей
export async function GET() {
  try {
    const galleries = await prisma.photoGallery.findMany({
      include: {
        photos: {
          take: 1,
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(galleries);
  } catch (error) {
    console.error('Ошибка при получении галерей:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении галерей' },
      { status: 500 }
    );
  }
}

// POST /api/galleries - создание новой галереи
export async function POST(request: NextRequest) {
  // Проверка авторизации
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  try {
    // Получаем данные из FormData
    const formData = await request.formData();

    // Извлекаем все поля из FormData
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const slug = formData.get('slug') as string;
    const isPublished = formData.get('isPublished') === 'true';

    // Создаем объект данных для валидации
    const galleryData = {
      title,
      description,
      slug,
      isPublished
    };

    // Валидация данных
    const validation = createGallerySchema.safeParse(galleryData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Проверяем уникальность slug
    const existingGallery = await prisma.photoGallery.findUnique({
      where: { slug: galleryData.slug },
    });

    if (existingGallery) {
      return NextResponse.json(
        { error: 'Галерея с таким slug уже существует' },
        { status: 400 }
      );
    }

    // Создаем новую галерею
    const newGallery = await prisma.photoGallery.create({
      data: {
        title: galleryData.title,
        description: galleryData.description,
        slug: galleryData.slug,
        isPublished: galleryData.isPublished,
      },
    });

    return NextResponse.json(newGallery, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании галереи:', error);

    // Возвращаем детальную информацию об ошибке
    const errorMessage = error instanceof Error
      ? error.message
      : 'Ошибка при создании галереи';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
