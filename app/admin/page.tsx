'use client'
import { useQuery } from '@tanstack/react-query'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { userApi, productApi, orderApi } from '@/lib/api'
import { formatPrice, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'

function StatCard({ title, value, change, icon: Icon, color, bg }: {
  title: string; value: string; change: number; icon: React.ElementType; color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-gray-500 text-xs mb-1">{title}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: userApi.getAll })
  const { data: products } = useQuery({ queryKey: ['admin-products'], queryFn: () => productApi.getAll() })
  const { data: orders } = useQuery({ queryKey: ['admin-orders'], queryFn: orderApi.getAll })

  const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0
  const activeUsers = users?.filter(u => u.isActive).length || 0

  const stats = [
    { title: 'Total Revenue', value: formatPrice(totalRevenue), change: 12.5, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Total Orders', value: String(orders?.length || 0), change: 8.2, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Active Users', value: String(activeUsers), change: 5.1, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Products', value: String(products?.length || 0), change: -2.3, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="p-6">
      <div className="mb-7">
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Recent Orders</h2>
            <a href="/admin/orders" className="text-orange-500 text-xs font-semibold hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {orders?.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{order.id}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Recent Users</h2>
            <a href="/admin/users" className="text-orange-500 text-xs font-semibold hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {users?.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name} className="w-9 h-9 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium capitalize">
                    {user.role}
                  </span>
                  <span className={`text-xs font-medium ${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-5 card-shadow lg:col-span-2">
          <h2 className="font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/admin/products', label: 'Add Product', icon: '📦', color: 'bg-blue-50 text-blue-600' },
              { href: '/admin/categories', label: 'Add Category', icon: '🏷️', color: 'bg-purple-50 text-purple-600' },
              { href: '/admin/promos', label: 'Create Promo', icon: '🎟️', color: 'bg-green-50 text-green-600' },
              { href: '/admin/banners', label: 'Add Banner', icon: '🖼️', color: 'bg-orange-50 text-orange-600' },
            ].map(action => (
              <a key={action.href} href={action.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-90 transition-opacity cursor-pointer`}>
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-semibold text-center">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
