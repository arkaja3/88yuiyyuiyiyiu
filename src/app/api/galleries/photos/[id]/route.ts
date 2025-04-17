import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Схема валидации для обновления фотографии
const updatePhotoSchema = z.object({
  url: z.string().url('Должен быть валидный URL').optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

// GET /api/galleries/photos/[id] - получение конкретной фотографии
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID фотографии должен быть числовым' },
        { status: 400 }
      );
    }

    const photo = await prisma.galleryPhoto.findUnique({
      where: { id },
      include: {
        gallery: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Фотография не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Ошибка при получении фотографии:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении фотографии' },
      { status: 500 }
    );
  }
}

// PATCH /api/galleries/photos/[id] - обновление фотографии
export async function PATCH(
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
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID фотографии должен быть числовым' },
        { status: 400 }
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
    const validation = updatePhotoSchema.safeParse(photoData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Проверяем существование фотографии
    const existingPhoto = await prisma.galleryPhoto.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      return NextResponse.json(
        { error: 'Фотография не найдена' },
        { status: 404 }
      );
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};
    if (url) updateData.url = url;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;

    // Обновляем фотографию
    const updatedPhoto = await prisma.galleryPhoto.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error('Ошибка при обновлении фотографии:', error);

    // Возвращаем детальную информацию об ошибке
    const errorMessage = error instanceof Error
      ? error.message
      : 'Ошибка при обновлении фотографии';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/galleries/photos/[id] - удаление фотографии
export async function DELETE(
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
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID фотографии должен быть числовым' },
        { status: 400 }
      );
    }

    // Проверяем существование фотографии
    const existingPhoto = await prisma.galleryPhoto.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      return NextResponse.json(
        { error: 'Фотография не найдена' },
        { status: 404 }
      );
    }

    // Удаляем фотографию
    await prisma.galleryPhoto.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении фотографии:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении фотографии' },
      { status: 500 }
    );
  }
}
