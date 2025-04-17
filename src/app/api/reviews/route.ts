import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/reviews - получение всех отзывов
export async function GET(req: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { id: 'desc' }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - создание нового отзыва
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Проверяем обязательные поля
    if (!body.customerName || !body.rating || !body.comment) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, rating, comment' },
        { status: 400 }
      )
    }

    // По умолчанию новые отзывы не публикуются, пока не будут одобрены администратором
    const isPublished = body.isPublished !== undefined ? body.isPublished : false;
    const isApproved = body.isApproved !== undefined ? body.isApproved : false;

    // Создаем новый отзыв
    const review = await prisma.review.create({
      data: {
        customerName: body.customerName,
        rating: parseInt(body.rating),
        comment: body.comment,
        imageUrl: body.imageUrl || null,
        reviewImageUrl: body.reviewImageUrl || null,
        videoUrl: body.videoUrl || null,
        isPublished: isPublished,
        isApproved: isApproved
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/:id - обновление отзыва
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing review ID' },
        { status: 400 }
      )
    }

    const body = await req.json()

    // Проверяем существование отзыва
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Обновляем отзыв
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        customerName: body.customerName !== undefined ? body.customerName : existingReview.customerName,
        rating: body.rating !== undefined ? parseInt(body.rating) : existingReview.rating,
        comment: body.comment !== undefined ? body.comment : existingReview.comment,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existingReview.imageUrl,
        reviewImageUrl: body.reviewImageUrl !== undefined ? body.reviewImageUrl : existingReview.reviewImageUrl,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl : existingReview.videoUrl,
        isPublished: body.isPublished !== undefined ? body.isPublished : existingReview.isPublished,
        isApproved: body.isApproved !== undefined ? body.isApproved : existingReview.isApproved
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/:id/approve - одобрение отзыва администратором
export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing review ID' },
        { status: 400 }
      )
    }

    const body = await req.json()

    // Проверяем существование отзыва
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Обновляем статус одобрения отзыва и публикации
    const approved = body.approved !== undefined ? body.approved : true

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        isApproved: approved,
        isPublished: approved // Если отзыв одобрен, он автоматически публикуется
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error approving review:', error)
    return NextResponse.json(
      { error: 'Failed to approve review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/:id - удаление отзыва
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing review ID' },
        { status: 400 }
      )
    }

    // Проверяем существование отзыва
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Удаляем отзыв
    await prisma.review.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
