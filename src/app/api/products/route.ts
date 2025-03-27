import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRISMA_MODELS } from '@/lib/constants'

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

    const products = await prisma[PRISMA_MODELS.PRODUCT].findMany({
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
      sku,
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

    // Validate required fields
    if (!name || !sku || !categoryId || !supplierId || !purchasePrice || !salePrice || !currentPrice || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const product = await prisma[PRISMA_MODELS.PRODUCT].create({
      data: {
        name,
        description,
        sku,
        barcode,
        purchasePrice,
        salePrice,
        currentPrice,
        quantity,
        minQuantity: minQuantity || 0,
        maxQuantity,
        location,
        status: status || 'ACTIVE',
        category: {
          connect: { id: categoryId }
        },
        supplier: {
          connect: { id: supplierId }
        },
        ...(brandId && {
          brand: {
            connect: { id: brandId }
          }
        }),
        ...(tags && {
          tags: {
            connect: tags.map((tagId: string) => ({ id: tagId }))
          }
        }),
        ...(images && {
          images: {
            create: images.map((image: { url: string; alt?: string; isMain?: boolean }) => ({
              url: image.url,
              alt: image.alt,
              isMain: image.isMain || false,
            }))
          }
        }),
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