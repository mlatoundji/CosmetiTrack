import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/products/ProductForm';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch product and related data
  const [product, categories, brands, suppliers] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
    }),
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

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Edit Product</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update the product information below.
        </p>
      </div>

      <ProductForm
        initialData={product}
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        onSubmit={async (data) => {
          'use server';
          
          const session = await getServerSession(authOptions);
          if (!session) {
            throw new Error('Unauthorized');
          }

          await prisma.product.update({
            where: { id: params.id },
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