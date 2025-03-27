import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Products', href: '/dashboard/products' },
    { name: 'Categories', href: '/dashboard/categories' },
    { name: 'Brands', href: '/dashboard/brands' },
    { name: 'Suppliers', href: '/dashboard/suppliers' },
    { name: 'Inventory', href: '/dashboard/inventory' },
    { name: 'Analytics', href: '/dashboard/analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white shadow-lg">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800">CosmetiTrack</h1>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'bg-gray-100 border-l-4 border-blue-500' : ''
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 