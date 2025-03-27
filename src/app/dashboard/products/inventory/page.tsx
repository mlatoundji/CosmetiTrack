import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Prisma } from '@prisma/client';

interface InventoryPageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ON_SALE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build where clause based on search and status
  const where: Prisma.ProductWhereInput = {
    AND: [
      // Search filter
      searchParams.search
        ? {
            OR: [
              { name: { contains: searchParams.search, mode: 'insensitive' } },
              { sku: { contains: searchParams.search, mode: 'insensitive' } },
            ],
          }
        : {},
      // Status filter
      searchParams.status ? { status: searchParams.status } : {},
    ],
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
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Inventory</h2>
          <p className="mt-1 text-sm text-gray-500">
            {total} products found
          </p>
        </div>
        <Link href="/dashboard/products/add">
          <Button>Add Product</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex-1 max-w-sm">
          <div className="relative">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search products..."
              className="block w-full rounded-md border border-gray-300 px-3 py-2 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </form>

        <div className="flex gap-4">
          <select
            name="status"
            defaultValue={searchParams.status}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_SALE">On Sale</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>

          <select
            name="sortBy"
            defaultValue={searchParams.sortBy || 'name'}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="name">Name</option>
            <option value="quantity">Quantity</option>
            <option value="currentPrice">Price</option>
            <option value="createdAt">Date Added</option>
          </select>

          <select
            name="sortOrder"
            defaultValue={searchParams.sortOrder || 'asc'}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.sku}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{product.category?.name}</div>
                  {product.brand && (
                    <div className="text-sm text-gray-500">{product.brand.name}</div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{product.quantity}</div>
                  <div className="text-sm text-gray-500">
                    {product.minQuantity} min / {product.maxQuantity || '∞'} max
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">${product.currentPrice.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    Cost: ${product.purchasePrice.toFixed(2)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      product.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'INACTIVE'
                        ? 'bg-gray-100 text-gray-800'
                        : product.status === 'ON_SALE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : product.status === 'OUT_OF_STOCK'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Link
              href={`/dashboard/products/inventory?page=${page - 1}`}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Link>
            <Link
              href={`/dashboard/products/inventory?page=${page + 1}`}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </Link>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Link
                  href={`/dashboard/products/inventory?page=${page - 1}`}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href={`/dashboard/products/inventory?page=${page + 1}`}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 