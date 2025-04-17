import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение всех преимуществ
export async function GET() {
  try {
    // Получаем все записи из таблицы Benefit и сортируем по полю order
    const benefits = await prisma.benefit.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    // Получаем статистические данные
    const stats = await prisma.benefitStats.findFirst({
      where: { id: 1 }
    })

    return NextResponse.json({ benefits, stats })
  } catch (error) {
    console.error('Error fetching benefits:', error)
    return NextResponse.json({ error: 'Не удалось получить данные о преимуществах' }, { status: 500 })
  }
}

// Создание нового преимущества
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Проверяем тип запроса (обновление benefit или stats)
    if (body.type === 'benefit') {
      // Валидация данных
      if (!body.title || !body.description || !body.icon) {
        return NextResponse.json(
          { error: 'Необходимо указать title, description и icon' },
          { status: 400 }
        )
      }

      // Находим максимальный порядок для установки нового элемента в конец списка
      const maxOrder = await prisma.benefit.findFirst({
        orderBy: {
          order: 'desc'
        },
        select: {
          order: true
        }
      })

      const newOrder = maxOrder ? maxOrder.order + 1 : 1

      // Создаем новое преимущество
      const benefit = await prisma.benefit.create({
        data: {
          title: body.title,
          description: body.description,
          icon: body.icon,
          order: newOrder
        }
      })

      return NextResponse.json({ benefit })
    } else if (body.type === 'stats') {
      // Обновляем статистические данные
      const stats = await prisma.benefitStats.upsert({
        where: { id: 1 },
        update: {
          clients: body.clients || undefined,
          directions: body.directions || undefined,
          experience: body.experience || undefined,
          support: body.support || undefined
        },
        create: {
          id: 1,
          clients: body.clients || '5000+',
          directions: body.directions || '15+',
          experience: body.experience || '10+',
          support: body.support || '24/7'
        }
      })

      return NextResponse.json({ stats })
    }

    return NextResponse.json({ error: 'Неверный тип запроса' }, { status: 400 })
  } catch (error) {
    console.error('Error creating benefit:', error)
    return NextResponse.json({ error: 'Не удалось создать преимущество' }, { status: 500 })
  }
}

// Обновление существующего преимущества
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Проверка типа запроса (обновление benefit или stats)
    if (body.type === 'benefit') {
      // Валидация данных
      if (!body.id) {
        return NextResponse.json({ error: 'Необходимо указать id преимущества' }, { status: 400 })
      }

      // Обновляем преимущество
      const benefit = await prisma.benefit.update({
        where: { id: Number(body.id) },
        data: {
          title: body.title || undefined,
          description: body.description || undefined,
          icon: body.icon || undefined,
          order: body.order !== undefined ? Number(body.order) : undefined
        }
      })

      return NextResponse.json({ benefit })
    } else if (body.type === 'stats') {
      // Обновляем статистические данные
      const stats = await prisma.benefitStats.update({
        where: { id: 1 },
        data: {
          clients: body.clients || undefined,
          directions: body.directions || undefined,
          experience: body.experience || undefined,
          support: body.support || undefined
        }
      })

      return NextResponse.json({ stats })
    }

    return NextResponse.json({ error: 'Неверный тип запроса' }, { status: 400 })
  } catch (error) {
    console.error('Error updating benefit:', error)
    return NextResponse.json({ error: 'Не удалось обновить преимущество' }, { status: 500 })
  }
}

// Удаление преимущества
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Необходимо указать id преимущества' }, { status: 400 })
    }

    // Удаляем преимущество
    const deletedBenefit = await prisma.benefit.delete({
      where: { id: Number(id) }
    })

    if (!deletedBenefit) {
      return NextResponse.json({ error: 'Преимущество не найдено' }, { status: 404 })
    }

    // Получаем все оставшиеся преимущества
    const remainingBenefits = await prisma.benefit.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    // Обновляем порядок для оставшихся элементов
    // Используем транзакцию для атомарного обновления всех элементов
    await prisma.$transaction(
      remainingBenefits.map((benefit, index) =>
        prisma.benefit.update({
          where: { id: benefit.id },
          data: { order: index + 1 }
        })
      )
    )

    return NextResponse.json({ success: true, deletedId: Number(id) })
  } catch (error) {
    console.error('Error deleting benefit:', error)
    return NextResponse.json({ error: 'Не удалось удалить преимущество' }, { status: 500 })
  }
}
