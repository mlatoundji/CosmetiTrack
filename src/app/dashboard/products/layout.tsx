'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface ProductsLayoutProps {
  children: React.ReactNode;
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard/products') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog, inventory, and related information.
          </p>
        </div>
        <Link href="/dashboard/products/add">
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/dashboard/products"
            className={`${
              isActive('/dashboard/products')
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Products
          </Link>
          <Link
            href="/dashboard/products/categories"
            className={`${
              isActive('/dashboard/products/categories')
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Categories
          </Link>
          <Link
            href="/dashboard/products/brands"
            className={`${
              isActive('/dashboard/products/brands')
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Brands
          </Link>
          <Link
            href="/dashboard/products/suppliers"
            className={`${
              isActive('/dashboard/products/suppliers')
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Suppliers
          </Link>
          <Link
            href="/dashboard/products/inventory"
            className={`${
              isActive('/dashboard/products/inventory')
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Inventory
          </Link>
        </nav>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <div className="px-4 py-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 