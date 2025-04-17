import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug не указан' }, { status: 400 })
    }

    const post = await prisma.blogPost.findUnique({
      where: {
        slug: slug,
        isPublished: true // Показываем только опубликованные статьи
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching blog post by slug:', error)
    return NextResponse.json(
      { error: 'Не удалось получить статью блога' },
      { status: 500 }
    )
  }
}
