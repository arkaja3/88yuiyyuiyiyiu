import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение настроек модального окна трансфера
export async function GET() {
  try {
    // Получаем настройки трансфера
    let config = await prisma.transferConfig.findUnique({
      where: { id: 1 }
    })

    // Если нет настроек, создаем дефолтные
    if (!config) {
      config = await prisma.transferConfig.create({
        data: {
          id: 1,
          title: 'Заказать трансфер',
          description: 'Заполните форму ниже, и мы свяжемся с вами для подтверждения заказа',
          useVehiclesFromDb: true,
          updatedAt: new Date()
        }
      })
    }

    // Если настройки указывают использовать автомобили из БД, загружаем их
    let vehicles = []
    if (config.useVehiclesFromDb) {
      const vehiclesData = await prisma.vehicle.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' }
      })

      // Преобразуем данные из БД в формат для модального окна
      vehicles = vehiclesData.map(vehicle => ({
        value: vehicle.class.toLowerCase().replace(/\s+/g, '-'),
        label: vehicle.class,
        price: `от 250.00 EUR`, // Здесь можно позже добавить получение цены из маршрутов
        image: vehicle.imageUrl,
        desc: `${vehicle.brand} ${vehicle.model}`,
        vehicleId: vehicle.id
      }))
    } else if (config.vehicleOptions) {
      // Если используются кастомные настройки, парсим их из JSON
      try {
        vehicles = JSON.parse(config.vehicleOptions)
      } catch (error) {
        console.error('Error parsing vehicleOptions JSON:', error)
      }
    }

    // Добавляем кастомные изображения, если они есть
    if (config.customImageUrls) {
      try {
        const customImages = JSON.parse(config.customImageUrls)
        vehicles = vehicles.map(vehicle => {
          const customImage = customImages[vehicle.value]
          if (customImage) {
            return { ...vehicle, image: customImage }
          }
          return vehicle
        })
      } catch (error) {
        console.error('Error parsing customImageUrls JSON:', error)
      }
    }

    return NextResponse.json({
      config: {
        ...config,
        vehicles
      }
    })
  } catch (error) {
    console.error('Error fetching transfer config:', error)
    return NextResponse.json(
      { error: 'Не удалось получить настройки модального окна трансфера' },
      { status: 500 }
    )
  }
}

// Обновление настроек модального окна трансфера
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Проверяем наличие базовых полей
    if (!body) {
      return NextResponse.json(
        { error: 'Отсутствуют данные для обновления' },
        { status: 400 }
      )
    }

    // Преобразуем массивы в JSON строки для хранения
    const data: any = {
      title: body.title,
      description: body.description,
      useVehiclesFromDb: body.useVehiclesFromDb
    }

    // Если есть кастомные настройки автомобилей, сохраняем их как JSON
    if (body.vehicleOptions && Array.isArray(body.vehicleOptions)) {
      data.vehicleOptions = JSON.stringify(body.vehicleOptions)
    }

    // Если есть кастомные изображения, сохраняем их как JSON
    if (body.customImageUrls && typeof body.customImageUrls === 'object') {
      data.customImageUrls = JSON.stringify(body.customImageUrls)
    }

    // Обновляем или создаем настройки
    const config = await prisma.transferConfig.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        ...data
      }
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('Error updating transfer config:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить настройки модального окна трансфера' },
      { status: 500 }
    )
  }
}
