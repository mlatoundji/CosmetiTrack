import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { Prisma } from '@prisma/client'

interface DashboardPageProps {
  searchParams: {
    period?: string
  }
}

type LowStockProduct = {
  id: string
  name: string
  quantity: number
  minQuantity: number
  maxQuantity: number | null
  category: { name: string } | null
}

type InventoryStats = {
  total_products: number
  total_value: number
  low_stock_count: number
  out_of_stock_count: number
}

type RecentActivity = {
  id: string
  type: string
  quantity: number
  product: { name: string }
  user: { name: string | null }
  createdAt: Date
  notes: string | null
}

type TopProduct = {
  id: string
  name: string
  total_sales: number
  total_revenue: number
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/login')
  }

  const period = searchParams.period || '30' // Default to last 30 days

  // Fetch dashboard data
  const [lowStockProducts, inventoryStats, recentActivity, topProducts] = await Promise.all([
    // Low stock products
    prisma.$queryRaw<LowStockProduct[]>`
      SELECT 
        p.id,
        p.name,
        p.quantity,
        p."minQuantity",
        p."maxQuantity",
        c.name as "category.name"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p.quantity <= p."minQuantity"
      ORDER BY p.quantity ASC
      LIMIT 5
    `,

    // Inventory statistics
    prisma.$queryRaw<InventoryStats[]>`
      SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(p.quantity * p."currentPrice"), 0) as total_value,
        COUNT(*) FILTER (WHERE p.quantity <= p."minQuantity") as low_stock_count,
        COUNT(*) FILTER (WHERE p.quantity = 0) as out_of_stock_count
      FROM "Product" p
    `,

    // Recent activity
    prisma.$queryRaw<RecentActivity[]>`
      SELECT 
        t.id,
        t.type,
        t.quantity,
        p.name as "product.name",
        u.name as "user.name",
        t."createdAt",
        t.notes
      FROM "Transaction" t
      JOIN "Product" p ON t."productId" = p.id
      JOIN "User" u ON t."userId" = u.id
      ORDER BY t."createdAt" DESC
      LIMIT 10
    `,

    // Top selling products
    prisma.$queryRaw<TopProduct[]>`
      SELECT 
        p.id,
        p.name,
        COUNT(*) as total_sales,
        SUM(t.quantity * p."currentPrice") as total_revenue
      FROM "Transaction" t
      JOIN "Product" p ON t."productId" = p.id
      WHERE t.type = 'STOCK_OUT'
      AND t."createdAt" >= NOW() - INTERVAL '${period} days'
      GROUP BY p.id, p.name
      ORDER BY total_sales DESC
      LIMIT 5
    `,
  ])

  return (
    <DashboardContent
      lowStockProducts={lowStockProducts}
      inventoryStats={inventoryStats[0]}
      recentActivity={recentActivity}
      topProducts={topProducts}
      period={period}
    />
  )
} 