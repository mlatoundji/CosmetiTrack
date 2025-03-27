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

    const images = await prisma.productImage.findMany({
      where,
      include: {
        product: true
      },
      orderBy: {
        isMain: 'desc'
      }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching product images:', error)
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
    const { productId, url, alt, isMain } = data

    // If this is the main image, unset any existing main images
    if (isMain) {
      await prisma.productImage.updateMany({
        where: {
          productId,
          isMain: true
        },
        data: {
          isMain: false
        }
      })
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        alt,
        isMain: isMain || false
      },
      include: {
        product: true
      }
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error creating product image:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 