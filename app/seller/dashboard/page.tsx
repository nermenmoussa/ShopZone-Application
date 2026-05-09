'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Package, DollarSign, ShoppingCart, Star, Plus, TrendingUp, ArrowUp } from 'lucide-react'
import { productApi, orderApi, sellerApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'

export default function SellerDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== 'seller') router.push('/auth/login')
  }, [user, router])

  const { data: seller } = useQuery({
    queryKey: ['seller', user?.id],
    queryFn: () => user ? sellerApi.getByUserId(user.id) : Promise.resolve(null),
    enabled: !!user,
  })

  const { data: products } = useQuery({
    queryKey: ['seller-products', seller?.id],
    queryFn: () => seller ? productApi.getBySeller(seller.id) : Promise.resolve([]),
    enabled: !!seller,
  })

  const { data: orders } = useQuery({
    queryKey: ['seller-orders', seller?.id],
    queryFn: () => orderApi.getAll(),
    enabled: !!seller,
  })

  if (!user || user.role !== 'seller') return null

  const sellerOrders = orders?.filter(o => o.sellerId === seller?.id) || []
  const revenue = sellerOrders.reduce((s, o) => s + o.total, 0)

  const stats = [
    { label: 'Total Revenue', value: formatPrice(revenue), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50', change: '+12%' },
    { label: 'Total Orders', value: String(sellerOrders.length), icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', change: '+8%' },
    { label: 'Products Listed', value: String(products?.length || 0), icon: Package, color: 'text-purple-500', bg: 'bg-purple-50', change: '+2' },
    { label: 'Store Rating', value: String(seller?.rating || 0), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', change: '+0.2' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">Seller Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{seller?.storeName || 'Your Store'}</p>
          </div>
          <Link href="/seller/products/new"
            className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
            <div key={label} className="bg-white rounded-2xl p-5 card-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className={color} />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-green-500">
                  <ArrowUp size={11} /> {change}
                </span>
              </div>
              <p className="text-gray-500 text-xs mb-1">{label}</p>
              <p className="text-xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 card-shadow">
            <h2 className="font-bold mb-5">Recent Orders</h2>
            {sellerOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingCart size={32} className="mx-auto mb-3 opacity-40" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellerOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm">{order.id}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 card-shadow">
              <h2 className="font-bold mb-4">Store Performance</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Sales</span>
                  <span className="font-semibold">{seller?.totalSales || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Earnings</span>
                  <span className="font-semibold text-green-500">{formatPrice(seller?.totalEarnings || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Payout</span>
                  <span className="font-semibold text-orange-500">{formatPrice(seller?.pendingPayout || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Store Rating</span>
                  <span className="font-semibold">⭐ {seller?.rating || 0}/5</span>
                </div>
              </div>
              <button className="mt-4 w-full py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                Request Payout
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 card-shadow">
              <h2 className="font-bold mb-3">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { href: '/seller/products', label: '📦 Manage Products' },
                  { href: '/seller/orders', label: '🛍️ View Orders' },
                  { href: '/seller/analytics', label: '📊 Analytics' },
                  { href: '/seller/profile', label: '🏪 Store Settings' },
                ].map(link => (
                  <Link key={link.href} href={link.href}
                    className="flex items-center py-2 text-sm text-gray-700 hover:text-orange-500 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        {products && products.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Your Products</h2>
              <Link href="/seller/products" className="text-orange-500 text-sm font-semibold hover:underline">
                Manage All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
