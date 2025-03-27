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
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: true,
        batch: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { productId, batchId, type, quantity, notes } = data;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the inventory transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          batchId,
          type,
          quantity,
          notes,
          performedBy: session.user.name || 'Unknown',
        },
        include: {
          product: true,
          batch: true,
        },
      });

      // Update product quantity based on transaction type
      const quantityChange = type === 'IN' ? quantity : -quantity;
      await tx.product.update({
        where: { id: productId },
        data: {
          quantity: {
            increment: quantityChange,
          },
        },
      });

      // If there's a batch, update its quantity
      if (batchId) {
        await tx.batch.update({
          where: { id: batchId },
          data: {
            quantity: {
              increment: quantityChange,
            },
          },
        });
      }

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating inventory transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 