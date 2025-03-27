import { Prisma } from '@prisma/client'

export type Product = Prisma.ProductGetPayload<{
  include: {
    category: true
    supplier: true
  }
}>

export type Category = Prisma.CategoryGetPayload<{}>
export type Supplier = Prisma.SupplierGetPayload<{}>
export type User = Prisma.UserGetPayload<{}> 