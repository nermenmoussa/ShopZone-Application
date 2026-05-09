'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight, MapPin, Clock } from 'lucide-react'
import { orderApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function OrdersPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => user ? orderApi.getByUser(user.id) : Promise.resolve([]),
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: '88px' }}>
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
        <p className="text-gray-500 mb-5">Please sign in to view your orders</p>
        <Link href="/auth/login" className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">{orders?.length || 0} orders placed</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center card-shadow">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link href="/products" className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(order => (
              <div key={order.id} className="bg-white rounded-2xl p-5 card-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm">{order.id}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(order.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-500">{formatPrice(order.total)}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide pb-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 shrink-0">
                      <img src={item.image} alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-medium max-w-[120px] line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking */}
                {order.trackingNumber && (
                  <div className="bg-blue-50 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
                    <span className="text-xs text-blue-700">
                      Tracking: <span className="font-bold">{order.trackingNumber}</span>
                    </span>
                    <span className="text-xs text-blue-500 font-medium">Track Package →</span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="relative">
                  {(() => {
                    const steps = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
                    const currentIdx = steps.indexOf(order.status)
                    const progress = order.status === 'cancelled' ? 0
                      : Math.max(0, (currentIdx / (steps.length - 1)) * 100)
                    return (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>Ordered</span>
                          <span>Confirmed</span>
                          <span>Shipped</span>
                          <span>Delivered</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full gradient-primary rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="flex justify-end mt-4">
                  <Link href={`/orders/${order.id}`}
                    className="flex items-center gap-1 text-orange-500 text-sm font-semibold hover:gap-2 transition-all">
                    View Details <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
