import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        supplier: true,
        reviews: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get inventory transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        productId,
        createdAt: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate ? new Date(endDate) : new Date(),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate inventory metrics
    const inventoryMetrics = {
      totalIn: transactions
        .filter((t) => t.type === 'STOCK_IN')
        .reduce((sum, t) => sum + t.quantity, 0),
      totalOut: transactions
        .filter((t) => t.type === 'STOCK_OUT')
        .reduce((sum, t) => sum + t.quantity, 0),
      averageDailyUsage:
        transactions.filter((t) => t.type === 'STOCK_OUT').length > 0
          ? transactions
              .filter((t) => t.type === 'STOCK_OUT')
              .reduce((sum, t) => sum + t.quantity, 0) /
            transactions.filter((t) => t.type === 'STOCK_OUT').length
          : 0,
    };

    // Calculate review metrics
    const reviewMetrics = {
      averageRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0,
      totalReviews: product.reviews.length,
      ratingDistribution: {
        1: product.reviews.filter((r) => r.rating === 1).length,
        2: product.reviews.filter((r) => r.rating === 2).length,
        3: product.reviews.filter((r) => r.rating === 3).length,
        4: product.reviews.filter((r) => r.rating === 4).length,
        5: product.reviews.filter((r) => r.rating === 5).length,
      },
    };

    // Calculate financial metrics
    const financialMetrics = {
      totalValue: product.quantity * product.currentPrice,
      averageCost: product.purchasePrice,
      profitMargin: ((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100,
      turnoverRate:
        inventoryMetrics.totalOut > 0
          ? inventoryMetrics.totalOut / product.quantity
          : 0,
    };

    // Generate daily inventory levels
    const dailyInventory = transactions.reduce((acc, transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = product.quantity;
      }
      acc[date] += transaction.type === 'STOCK_IN' ? transaction.quantity : -transaction.quantity;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      product,
      inventoryMetrics,
      reviewMetrics,
      financialMetrics,
      dailyInventory,
    });
  } catch (error) {
    console.error('Error generating product analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 