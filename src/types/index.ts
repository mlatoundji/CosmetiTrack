import { Prisma } from '@prisma/client'

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true
    supplier: true
  }
}>

export type SafeProduct = Omit<ProductWithRelations, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
} 