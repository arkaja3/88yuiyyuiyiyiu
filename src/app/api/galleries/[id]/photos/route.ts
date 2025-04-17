import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Схема валидации для добавления фотографии
const addPhotoSchema = z.object({
  url: z.string().url('Должен быть валидный URL'),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

// GET /api/galleries/[id]/photos - получение всех фотографий галереи
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = parseInt(params.id);

    if (isNaN(galleryId)) {
      return NextResponse.json(
        { error: 'ID галереи должен быть числовым' },
        { status: 400 }
      );
    }

    // Проверяем существование галереи
    const gallery = await prisma.photoGallery.findUnique({
      where: { id: galleryId },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: 'Галерея не найдена' },
        { status: 404 }
      );
    }

    const photos = await prisma.galleryPhoto.findMany({
      where: { galleryId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Ошибка при получении фотографий:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении фотографий' },
      { status: 500 }
    );
  }
}

// POST /api/galleries/[id]/photos - добавление новой фотографии
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Проверка авторизации
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 }
    );
  }

  try {
    const galleryId = parseInt(params.id);

    if (isNaN(galleryId)) {
      return NextResponse.json(
        { error: 'ID галереи должен быть числовым' },
        { status: 400 }
      );
    }

    // Проверяем существование галереи
    const gallery = await prisma.photoGallery.findUnique({
      where: { id: galleryId },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: 'Галерея не найдена' },
        { status: 404 }
      );
    }

    // Получаем данные из FormData
    const formData = await request.formData();

    // Извлекаем значения из FormData
    const url = formData.get('url') as string;
    const title = formData.get('title') as string || null;
    const description = formData.get('description') as string || null;
    const orderStr = formData.get('order') as string;
    const order = orderStr ? parseInt(orderStr) : undefined;

    // Создаем объект для валидации
    const photoData = {
      url,
      title,
      description,
      order
    };

    // Валидация данных
    const validation = addPhotoSchema.safeParse(photoData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Определяем порядок если не указан
    let finalOrder = order;
    if (finalOrder === undefined) {
      const lastPhoto = await prisma.galleryPhoto.findFirst({
        where: { galleryId },
        orderBy: { order: 'desc' },
      });
      finalOrder = lastPhoto ? lastPhoto.order + 1 : 0;
    }

    // Создаем новую фотографию
    const newPhoto = await prisma.galleryPhoto.create({
      data: {
        url: photoData.url,
        title: photoData.title,
        description: photoData.description,
        order: finalOrder,
        galleryId,
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error('Ошибка при добавлении фотографии:', error);

    // Возвращаем детальную информацию об ошибке
    const errorMessage = error instanceof Error
      ? error.message
      : 'Ошибка при добавлении фотографии';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
