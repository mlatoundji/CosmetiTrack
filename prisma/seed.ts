const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cosmetitrack.com' },
    update: {},
    create: {
      email: 'admin@cosmetitrack.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Beauty Wholesale',
      email: 'contact@beautywholesale.com',
      phone: '+33123456789',
      address: '123 Rue de la Beauté, Paris',
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Cosmetics Direct',
      email: 'info@cosmeticsdirect.com',
      phone: '+33987654321',
      address: '456 Avenue des Cosmétiques, Lyon',
    },
  })

  // Create products
  await prisma.product.createMany({
    data: [
      {
        name: 'Crème Hydratante',
        description: 'Crème hydratante pour le visage',
        sku: 'CH001',
        price: 29.99,
        currentStock: 50,
        minimumStock: 10,
        category: 'Soins du visage',
        brand: 'NaturalBeauty',
        supplierId: supplier1.id,
      },
      {
        name: 'Rouge à Lèvres Mat',
        description: 'Rouge à lèvres longue tenue',
        sku: 'RL001',
        price: 19.99,
        currentStock: 75,
        minimumStock: 15,
        category: 'Maquillage',
        brand: 'GlamourPro',
        supplierId: supplier2.id,
      },
      {
        name: 'Sérum Anti-âge',
        description: 'Sérum anti-rides concentré',
        sku: 'SA001',
        price: 49.99,
        currentStock: 30,
        minimumStock: 8,
        category: 'Soins du visage',
        brand: 'LuxeSkin',
        supplierId: supplier1.id,
      },
    ],
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 