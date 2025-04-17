import { NextRequest, NextResponse } from 'next/server'
import { postImageService } from '@/lib/postimage-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.imageUrl) {
      return NextResponse.json(
        { error: 'URL изображения не указан' },
        { status: 400 }
      )
    }

    // Загружаем изображение через PostImage API
    const url = await postImageService.uploadFromUrl(body.imageUrl, {
      title: body.title || 'Изображение из Royal Transfer',
      description: body.description || 'Загружено через Royal Transfer API',
      tags: body.tags || ['royaltransfer']
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Ошибка при загрузке изображения по URL:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить изображение по URL' },
      { status: 500 }
    )
  }
}
