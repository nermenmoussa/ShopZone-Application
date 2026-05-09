'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Circle, Truck } from 'lucide-react'
import { orderApi } from '@/lib/api'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const orderSteps: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'placed', label: 'Order Placed', icon: '📋' },
  { status: 'confirmed', label: 'Confirmed', icon: '✅' },
  { status: 'processing', label: 'Processing', icon: '⚙️' },
  { status: 'shipped', label: 'Shipped', icon: '📦' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { status: 'delivered', label: 'Delivered', icon: '🏠' },
]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '88px' }}>
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: '88px' }}>
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <button onClick={() => router.push('/orders')} className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold">
          My Orders
        </button>
      </div>
    )
  }

  const currentStepIdx = orderSteps.findIndex(s => s.status === order.status)

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/orders')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black">{order.id}</h1>
            <p className="text-gray-500 text-sm">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={`ml-auto px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Order Tracking */}
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h2 className="font-bold mb-6 flex items-center gap-2">
                <Truck size={18} className="text-orange-500" /> Order Tracking
              </h2>

              {order.status !== 'cancelled' ? (
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />
                  <div className="absolute left-4 top-4 w-0.5 bg-orange-400 transition-all duration-700"
                    style={{ height: `${Math.max(0, (currentStepIdx / (orderSteps.length - 1)) * 100)}%` }} />

                  <div className="space-y-6">
                    {orderSteps.map((step, i) => {
                      const completed = i <= currentStepIdx
                      const historyEntry = order.statusHistory?.find(h => h.status === step.status)
                      return (
                        <div key={step.status} className="flex gap-4 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 text-sm
                            ${completed ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 bg-white'}`}>
                            {completed ? <CheckCircle size={14} /> : <Circle size={14} className="text-gray-300" />}
                          </div>
                          <div className={completed ? '' : 'opacity-40'}>
                            <p className="font-semibold text-sm">{step.icon} {step.label}</p>
                            {historyEntry && (
                              <>
                                <p className="text-xs text-gray-500 mt-0.5">{historyEntry.note}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{formatDate(historyEntry.timestamp)}</p>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">❌</div>
                  <p className="font-semibold text-red-500">Order Cancelled</p>
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-5 p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800">
                    Tracking Number: <span className="font-bold">{order.trackingNumber}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Package size={18} className="text-orange-500" /> Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                    <img src={item.image} alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-orange-500 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-5 card-shadow">
              <h3 className="font-bold mb-4">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={order.shipping === 0 ? 'text-green-500' : ''}>
                    {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span><span>{formatPrice(order.tax)}</span>
                </div>
                {order.promoCode && (
                  <div className="flex justify-between text-orange-500">
                    <span>Promo Code</span><span>{order.promoCode}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base pt-2 border-t border-gray-100">
                  <span>Total</span><span className="text-orange-500">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl p-5 card-shadow">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-orange-500" /> Payment
              </h3>
              <p className="text-sm capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
              <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                {getStatusLabel(order.paymentStatus)}
              </span>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-5 card-shadow">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-orange-500" /> Delivery Address
              </h3>
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
