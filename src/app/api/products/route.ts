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
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const brand = searchParams.get('brand')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    if (category) where.categoryId = category
    if (brand) where.brandId = brand
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        brand: true,
        tags: true,
        images: true,
        batches: {
          include: {
            qualityChecks: true,
          },
        },
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
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
    const {
      name,
      description,
      categoryId,
      supplierId,
      brandId,
      barcode,
      purchasePrice,
      salePrice,
      currentPrice,
      quantity,
      minQuantity,
      maxQuantity,
      location,
      status,
      tags,
      images,
    } = data

    const product = await prisma.product.create({
      data: {
        name,
        description,
        categoryId,
        supplierId,
        brandId,
        barcode,
        purchasePrice,
        salePrice,
        currentPrice,
        quantity,
        minQuantity,
        maxQuantity,
        location,
        status,
        tags: {
          connect: tags?.map((tagId: string) => ({ id: tagId })) || [],
        },
        images: {
          create: images?.map((image: { url: string; alt?: string; isMain?: boolean }) => ({
            url: image.url,
            alt: image.alt,
            isMain: image.isMain || false,
          })) || [],
        },
      },
      include: {
        category: true,
        supplier: true,
        brand: true,
        tags: true,
        images: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 