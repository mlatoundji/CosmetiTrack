import { PrismaClient } from '@prisma/client'
import { PRISMA_MODELS } from './constants'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  }
})

// Gestion des erreurs de connexion
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e)
  // Reconnexion automatique en cas d'erreur
  prisma.$disconnect()
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Type-safe model access
export const getModel = (model: keyof typeof PRISMA_MODELS) => {
  return prisma[PRISMA_MODELS[model]]
}

// Example usage:
// const transactions = await getModel('TRANSACTION').findMany() 