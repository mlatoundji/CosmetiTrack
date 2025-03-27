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
    const batchId = searchParams.get('batchId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = {}
    if (batchId) where.batchId = batchId
    if (type) where.type = type
    if (status) where.status = status

    const qualityChecks = await prisma.qualityCheck.findMany({
      where,
      include: {
        batch: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        performedAt: 'desc'
      }
    })

    return NextResponse.json(qualityChecks)
  } catch (error) {
    console.error('Error fetching quality checks:', error)
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
    const { batchId, type, status, notes, performedBy } = data

    const qualityCheck = await prisma.qualityCheck.create({
      data: {
        batchId,
        type,
        status,
        notes,
        performedBy: performedBy || session.user.name || 'Unknown'
      },
      include: {
        batch: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(qualityCheck)
  } catch (error) {
    console.error('Error creating quality check:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 