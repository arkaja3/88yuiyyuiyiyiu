import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Схема валидации для обновления галереи
const updateGallerySchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа').optional(),
  description: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug должен содержать только строчные буквы, цифры и дефисы')
    .min(3, 'Slug должен содержать минимум 3 символа')
    .optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/galleries/[id] - получение конкретной галереи
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID галереи должен быть числовым' },
        { status: 400 }
      );
    }

    const gallery = await prisma.photoGallery.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: 'Галерея не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(gallery);
  } catch (error) {
    console.error('Ошибка при получении галереи:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении галереи' },
      { status: 500 }
    );
  }
}

// PATCH /api/galleries/[id] - обновление галереи
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
        { error: 'ID галереи должен быть числовым' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const body = {
      title: formData.get('title'),
      description: formData.get('description'),
      slug: formData.get('slug'),
      isPublished: formData.get('isPublished') === 'true',
    };

    // Валидация данных
    const validation = updateGallerySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Проверяем существование галереи
    const existingGallery = await prisma.photoGallery.findUnique({
      where: { id },
    });

    if (!existingGallery) {
      return NextResponse.json(
        { error: 'Галерея не найдена' },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug если он изменяется
    if (body.slug && body.slug !== existingGallery.slug) {
      const galleryWithSlug = await prisma.photoGallery.findUnique({
        where: { slug: body.slug },
      });

      if (galleryWithSlug) {
        return NextResponse.json(
          { error: 'Галерея с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    // Обновляем галерею
    const updatedGallery = await prisma.photoGallery.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        slug: body.slug,
        isPublished: body.isPublished,
      },
    });

    return NextResponse.json(updatedGallery);
  } catch (error) {
    console.error('Ошибка при обновлении галереи:', error);

    // Возвращаем более детальную информацию об ошибке
    const errorMessage = error instanceof Error
      ? error.message
      : 'Ошибка при обновлении галереи';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/galleries/[id] - удаление галереи
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
        { error: 'ID галереи должен быть числовым' },
        { status: 400 }
      );
    }

    // Проверяем существование галереи
    const existingGallery = await prisma.photoGallery.findUnique({
      where: { id },
    });

    if (!existingGallery) {
      return NextResponse.json(
        { error: 'Галерея не найдена' },
        { status: 404 }
      );
    }

    // Удаляем галерею и связанные фотографии
    await prisma.photoGallery.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении галереи:', error);

    // Возвращаем более детальную информацию об ошибке
    const errorMessage = error instanceof Error
      ? error.message
      : 'Ошибка при удалении галереи';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
