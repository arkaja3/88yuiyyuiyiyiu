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

// POST /api/galleries/[id]/photos/batch - пакетное добавление фотографий
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

    // Извлекаем все URL из FormData
    const urls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('urls[') && typeof value === 'string') {
        urls.push(value);
      }
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'Не указаны URL для загрузки' },
        { status: 400 }
      );
    }

    const photosToAdd = [];
    const errors = [];

    // Проверяем валидность каждого URL
    for (let i = 0; i < urls.length; i++) {
      const validation = addPhotoSchema.safeParse({ url: urls[i] });
      if (validation.success) {
        photosToAdd.push({
          url: urls[i],
          title: null,
          description: null,
          order: i,
          galleryId,
        });
      } else {
        errors.push({
          index: i,
          url: urls[i],
          errors: validation.error.format(),
        });
      }
    }

    if (photosToAdd.length === 0) {
      return NextResponse.json(
        { error: 'Все указанные URL некорректны', details: errors },
        { status: 400 }
      );
    }

    // Создаем все валидные фотографии
    const createdPhotos = await prisma.$transaction(
      photosToAdd.map(photo =>
        prisma.galleryPhoto.create({ data: photo })
      )
    );

    return NextResponse.json({
      created: createdPhotos,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка при пакетном добавлении фотографий:', error);

    // Возвращаем более детальную информацию об ошибке
    const errorMessage = error instanceof Error
      ? error.message
      : 'Ошибка при пакетном добавлении фотографий';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
