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

    // Get total counts
    const [
      totalProducts,
      totalSuppliers,
      totalCategories,
      totalBrands,
      totalTags,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.supplier.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.tag.count(),
    ])

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        quantity: {
          lte: prisma.product.fields.minQuantity,
        },
      },
      include: {
        category: true,
        brand: true,
        supplier: true,
      },
      orderBy: {
        quantity: 'asc',
      },
      take: 5,
    })

    // Get recent inventory transactions
    const recentTransactions = await prisma.transaction.findMany({
      include: {
        product: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Get top products by quantity
    const topProducts = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        supplier: true,
      },
      orderBy: {
        quantity: 'desc',
      },
      take: 5,
    })

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    // Calculate inventory value
    const inventoryValue = await prisma.product.aggregate({
      _sum: {
        quantity: true,
        currentPrice: true,
      },
    })

    const totalInventoryValue =
      (inventoryValue._sum.quantity || 0) * (inventoryValue._sum.currentPrice || 0)

    return NextResponse.json({
      totalProducts,
      totalSuppliers,
      totalCategories,
      totalBrands,
      totalTags,
      lowStockProducts,
      recentTransactions,
      topProducts,
      recentReviews,
      totalInventoryValue,
    })
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 