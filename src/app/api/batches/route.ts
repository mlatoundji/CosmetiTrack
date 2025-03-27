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
    const status = searchParams.get('status')

    const where: any = {}
    if (productId) where.productId = productId
    if (status) where.status = status

    const batches = await prisma.batch.findMany({
      where,
      include: {
        product: true,
        qualityChecks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
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
      batchNumber,
      productId,
      quantity,
      purchasePrice,
      expiryDate,
      manufacturingDate,
      qualityChecks
    } = data

    const batch = await prisma.batch.create({
      data: {
        batchNumber,
        productId,
        quantity,
        purchasePrice,
        expiryDate,
        manufacturingDate,
        qualityChecks: {
          create: qualityChecks?.map((check: any) => ({
            type: check.type,
            status: check.status,
            notes: check.notes,
            performedBy: check.performedBy
          })) || []
        }
      },
      include: {
        product: true,
        qualityChecks: true
      }
    })

    // Update product quantity
    await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: quantity
        }
      }
    })

    return NextResponse.json(batch)
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 