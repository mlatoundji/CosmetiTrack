import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/products/ProductForm';

export default async function AddProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch categories, brands, and suppliers for the form
  const [categories, brands, suppliers] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Add New Product</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create a new product by filling out the information below.
        </p>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        onSubmit={async (data) => {
          'use server';
          
          const session = await getServerSession(authOptions);
          if (!session) {
            throw new Error('Unauthorized');
          }

          await prisma.product.create({
            data: {
              ...data,
              purchasePrice: Number(data.purchasePrice),
              salePrice: Number(data.salePrice),
              currentPrice: Number(data.currentPrice),
              quantity: Number(data.quantity),
              minQuantity: Number(data.minQuantity),
              maxQuantity: data.maxQuantity ? Number(data.maxQuantity) : null,
            },
          });

          redirect('/dashboard/products');
        }}
      />
    </div>
  );
} 