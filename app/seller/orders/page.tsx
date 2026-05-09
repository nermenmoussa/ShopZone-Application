'use client'

import { useEffect } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'

import { orderApi, sellerApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import {
  formatDate,
  formatPrice,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils'

import toast from 'react-hot-toast'
import type { Order, OrderStatus } from '@/types'

const statuses: OrderStatus[] = [
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

export default function SellerOrdersPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user, router])

  // Seller
  const { data: seller } = useQuery({
    queryKey: ['seller', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      return sellerApi.getByUserId(user.id)
    },
    enabled: !!user?.id,
  })

  // Orders
  const { data: allOrders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['seller-orders', seller?.id],
    queryFn: orderApi.getAll,
    enabled: !!seller?.id,
  })

  // Filter + Sort
  const orders = allOrders
    .filter(order => order.sellerId === seller?.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )

  // Revenue
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total || 0), 0
  )

  // Update Status
  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: OrderStatus
    }) => {
      const order = allOrders.find(o => o.id === id)
      if (!order) throw new Error('Order not found')

      const statusHistory = [
        ...(order.statusHistory || []),
        {
          status,
          timestamp: new Date().toISOString(),
          note: `Status updated to ${getStatusLabel(status)}`,
        },
      ]

      return orderApi.update(id, { status, statusHistory })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
      toast.success('Order updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update order')
    },
  })

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders.length, color: 'text-blue-500' },
            { label: 'Pending', value: orders.filter(o => o.status === 'placed').length, color: 'text-yellow-500' },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-500' },
            { label: 'Revenue', value: formatPrice(totalRevenue), color: 'text-orange-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 card-shadow">
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (

          // Empty State
          <div className="bg-white rounded-3xl p-16 text-center card-shadow">
            <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">No orders yet</h3>
            <p className="text-gray-500">
              Orders will appear here once customers start buying
            </p>
          </div>
        ) : (

          // Orders List
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-5 card-shadow">

                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold">{order.id}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="font-black text-orange-500">
                      {formatPrice(order.total || 0)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide pb-1">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 shrink-0">
                      <img src={item.image} alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-medium max-w-[100px] truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="text-sm text-gray-600">
                    📦 Ship to:{' '}
                    <span className="font-semibold">
                      {order.shippingAddress?.city || 'N/A'},{' '}
                      {order.shippingAddress?.country || ''}
                    </span>
                  </div>
                  <select
                    value={order.status}
                    onChange={e => updateStatus.mutate({
                      id: order.id,
                      status: e.target.value as OrderStatus,
                    })}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-orange-400 bg-white">
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}