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
    const days = parseInt(searchParams.get('days') || '30');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get historical transaction data
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        productId,
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate daily consumption
    const dailyConsumption = transactions.reduce((acc, transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      if (transaction.type === 'OUT') {
        acc[date] += transaction.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate average daily consumption
    const consumptionValues = Object.values(dailyConsumption);
    const averageDailyConsumption =
      consumptionValues.reduce((sum, value) => sum + value, 0) / consumptionValues.length;

    // Get current stock level
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { quantity: true, minQuantity: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate days until stockout
    const daysUntilStockout = Math.floor(product.quantity / averageDailyConsumption);

    // Calculate reorder point
    const reorderPoint = Math.ceil(averageDailyConsumption * 7); // 7 days of safety stock

    // Generate forecast for next 30 days
    const forecast = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const projectedStock = Math.max(
        0,
        product.quantity - averageDailyConsumption * (i + 1)
      );
      return {
        date: date.toISOString().split('T')[0],
        projectedStock,
        needsReorder: projectedStock <= reorderPoint,
      };
    });

    return NextResponse.json({
      currentStock: product.quantity,
      minStock: product.minQuantity,
      averageDailyConsumption,
      daysUntilStockout,
      reorderPoint,
      forecast,
    });
  } catch (error) {
    console.error('Error generating inventory forecast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 