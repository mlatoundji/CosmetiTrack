import { PrismaClient } from '@prisma/client'
import { PRISMA_MODELS } from './constants'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration pour la gestion des connexions
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
    // Ajout des options de connexion
    connection: {
      options: {
        statement_timeout: 60000, // 60 secondes
        idle_in_transaction_session_timeout: 60000, // 60 secondes
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Gestion des erreurs et reconnexion
prisma.$on('error', async () => {
  console.error('Prisma Client error - attempting reconnection')
  await prisma.$disconnect()
  globalForPrisma.prisma = prismaClientSingleton()
})

// Nettoyage des connexions lors de l'arrêt
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Type-safe model access
export const getModel = (model: keyof typeof PRISMA_MODELS) => {
  return prisma[PRISMA_MODELS[model]]
}

// Example usage:
// const transactions = await getModel('TRANSACTION').findMany() 