import { TransactionType } from '@prisma/client';

export const PRISMA_MODELS = {
  TRANSACTION: 'transaction',
  PRODUCT: 'product',
  USER: 'user',
  CATEGORY: 'category',
  BRAND: 'brand',
  SUPPLIER: 'supplier',
  REVIEW: 'review',
  TAG: 'tag',
} as const;

export const TRANSACTION_TYPES = {
  STOCK_IN: TransactionType.STOCK_IN,
  STOCK_OUT: TransactionType.STOCK_OUT,
  ADJUSTMENT: TransactionType.ADJUSTMENT,
} as const;

export type PrismaModel = typeof PRISMA_MODELS[keyof typeof PRISMA_MODELS]; 