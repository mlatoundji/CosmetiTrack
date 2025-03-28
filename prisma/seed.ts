import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

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

  // Create categories
  const skinCare = await prisma.category.create({
    data: {
      name: 'Soins du visage',
      description: 'Produits pour le soin du visage',
    },
  })

  const makeup = await prisma.category.create({
    data: {
      name: 'Maquillage',
      description: 'Produits de maquillage',
    },
  })

  // Create brands
  const naturalBeauty = await prisma.brand.create({
    data: {
      name: 'NaturalBeauty',
      description: 'Produits de beauté naturels',
    },
  })

  const glamourPro = await prisma.brand.create({
    data: {
      name: 'GlamourPro',
      description: 'Produits de maquillage professionnels',
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
  await prisma.product.create({
    data: {
      name: 'Crème Hydratante',
      description: 'Crème hydratante pour le visage',
      sku: 'CH001',
      barcode: 'CH001BAR',
      purchasePrice: 15.99,
      salePrice: 29.99,
      currentPrice: 29.99,
      quantity: 50,
      minQuantity: 10,
      maxQuantity: 100,
      status: 'ACTIVE',
      categoryId: skinCare.id,
      brandId: naturalBeauty.id,
      supplierId: supplier1.id,
    },
  })

  await prisma.product.create({
    data: {
      name: 'Rouge à Lèvres Mat',
      description: 'Rouge à lèvres longue tenue',
      sku: 'RL001',
      barcode: 'RL001BAR',
      purchasePrice: 8.99,
      salePrice: 19.99,
      currentPrice: 19.99,
      quantity: 75,
      minQuantity: 15,
      maxQuantity: 150,
      status: 'ACTIVE',
      categoryId: makeup.id,
      brandId: glamourPro.id,
      supplierId: supplier2.id,
    },
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