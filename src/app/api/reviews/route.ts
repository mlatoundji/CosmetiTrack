import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    const where: any = {}
    if (productId) where.productId = productId

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { productId, rating, comment, customerName } = data

    const review = await prisma.review.create({
      data: {
        productId,
        rating,
        comment,
        customerName
      },
      include: {
        product: true
      }
    })

    // Update product average rating
    const productReviews = await prisma.review.findMany({
      where: { productId }
    })

    const averageRating =
      productReviews.reduce((acc, review) => acc + review.rating, 0) /
      productReviews.length

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 