'use client'

import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface DashboardContentProps {
  lowStockProducts: Array<{
    id: string
    name: string
    quantity: number
    minQuantity: number
    maxQuantity: number | null
    category: { name: string } | null
  }>
  inventoryStats: {
    total_products: number
    total_value: number
    low_stock_count: number
    out_of_stock_count: number
  }
  recentActivity: Array<{
    id: string
    type: string
    quantity: number
    product: { name: string }
    user: { name: string | null }
    createdAt: Date
    notes: string | null
  }>
  topProducts: Array<{
    id: string
    name: string
    total_sales: number
    total_revenue: number
  }>
  period: string
}

export function DashboardContent({
  lowStockProducts,
  inventoryStats,
  recentActivity,
  topProducts,
  period,
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your inventory and recent activity
          </p>
        </div>
        <div className="flex gap-4">
          <select
            name="period"
            defaultValue={period}
            className="block rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-medium text-gray-500">Total Products</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{inventoryStats.total_products}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-medium text-gray-500">Total Value</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            ${inventoryStats.total_value.toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-medium text-gray-500">Low Stock Items</div>
          <div className="mt-2 text-3xl font-semibold text-red-600">{inventoryStats.low_stock_count}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-medium text-gray-500">Out of Stock</div>
          <div className="mt-2 text-3xl font-semibold text-red-600">{inventoryStats.out_of_stock_count}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Products */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-base font-medium text-gray-900">Low Stock Products</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">{product.quantity} units</div>
                    <div className="text-sm text-gray-500">
                      Min: {product.minQuantity} | Max: {product.maxQuantity || '∞'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 px-6 py-4">
            <Link
              href="/dashboard/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-900"
            >
              View all products →
            </Link>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-base font-medium text-gray-900">Top Selling Products</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {topProducts.map((product) => (
              <div key={product.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.total_sales} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${product.total_revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white lg:col-span-2">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-base font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{activity.product.name}</div>
                    <div className="text-sm text-gray-500">
                      {activity.type} • {activity.quantity} units • by {activity.user.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                    {activity.notes && (
                      <div className="text-sm text-gray-500">{activity.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Link href="/dashboard/products/add">
          <Button className="w-full">Add Product</Button>
        </Link>
        <Link href="/dashboard/products/categories/add">
          <Button className="w-full">Add Category</Button>
        </Link>
        <Link href="/dashboard/products/brands/add">
          <Button className="w-full">Add Brand</Button>
        </Link>
        <Link href="/dashboard/products/suppliers/add">
          <Button className="w-full">Add Supplier</Button>
        </Link>
      </div>
    </div>
  )
} 