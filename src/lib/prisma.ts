import { PrismaClient } from '@prisma/client'
import { PRISMA_MODELS } from './constants'

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

export { prisma }

// Gestion des erreurs et reconnexion
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Query: ' + e.query)
  }
})

// Nettoyage des connexions lors de l'arrêt
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Type-safe model access
export const getModel = (model: keyof typeof PRISMA_MODELS) => {
  return prisma[PRISMA_MODELS[model]]
}

// Example usage:
// const transactions = await getModel('TRANSACTION').findMany() 