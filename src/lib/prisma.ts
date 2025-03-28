import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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