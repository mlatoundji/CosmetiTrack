import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductList } from '@/components/products/ProductList';
import { Prisma, ProductStatus } from '@prisma/client';

interface ProductsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
    brand?: string;
    supplier?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  // Build where clause based on filters
  const where: Prisma.ProductWhereInput = {
    AND: [
      searchParams.search
        ? {
            OR: [
              { name: { contains: searchParams.search, mode: Prisma.QueryMode.insensitive } },
              { sku: { contains: searchParams.search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: searchParams.search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {},
      searchParams.category ? { categoryId: searchParams.category } : {},
      searchParams.brand ? { brandId: searchParams.brand } : {},
      searchParams.supplier ? { supplierId: searchParams.supplier } : {},
      searchParams.status ? { status: searchParams.status as ProductStatus } : {},
    ].filter(condition => Object.keys(condition).length > 0),
  };

  // Build orderBy clause based on sort parameters
  const orderBy: Prisma.ProductOrderByWithRelationInput = searchParams.sortBy
    ? { [searchParams.sortBy]: searchParams.sortOrder || 'asc' }
    : { name: 'asc' };

  // Fetch products with related data
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        brand: true,
        supplier: true,
        images: {
          where: { isMain: true },
          take: 1,
        },
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Fetch filter options
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">All Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            {total} products found
          </p>
        </div>
      </div>

      <ProductList
        products={products}
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        currentPage={page}
        totalPages={totalPages}
        filters={searchParams}
      />
    </div>
  );
} 