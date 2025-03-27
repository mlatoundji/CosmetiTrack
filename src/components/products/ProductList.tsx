'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  currentPrice: number;
  quantity: number;
  minQuantity: number;
  images: Array<{
    url: string;
    alt: string | null;
    isMain: boolean;
  }>;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductListProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  currentPage: number;
  totalPages: number;
  filters: {
    search?: string;
    category?: string;
    brand?: string;
    supplier?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export function ProductList({
  products,
  categories,
  brands,
  suppliers,
  currentPage,
  totalPages,
  filters,
}: ProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1'); // Reset to first page when filters change
    router.push(`/dashboard/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            value={filters.category || ''}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filters.brand || ''}
            onChange={(e) => updateFilters({ brand: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <select
            value={filters.supplier || ''}
            onChange={(e) => updateFilters({ supplier: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_SALE">On Sale</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="DISCONTINUED">Discontinued</option>
          </select>

          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="name">Name</option>
            <option value="currentPrice">Price</option>
            <option value="quantity">Stock</option>
            <option value="createdAt">Date Added</option>
          </select>

          <select
            value={filters.sortOrder || 'asc'}
            onChange={(e) => updateFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(currentPage - 1));
                router.push(`/dashboard/products?${params.toString()}`);
              }}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(currentPage + 1));
                router.push(`/dashboard/products?${params.toString()}`);
              }}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(currentPage - 1));
                    router.push(`/dashboard/products?${params.toString()}`);
                  }}
                  disabled={currentPage === 1}
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
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(currentPage + 1));
                    router.push(`/dashboard/products?${params.toString()}`);
                  }}
                  disabled={currentPage === totalPages}
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
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 