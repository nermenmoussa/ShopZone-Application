'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useCartStore, useAuthStore } from '@/store'
import { orderApi } from '@/lib/api'
import { formatPrice, generateOrderId } from '@/lib/utils'

import type { Order, OrderItem, PaymentMethod } from '@/types'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { StripePayment } from '@/components/checkout/StripePayment'

interface CheckoutForm {
  name: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

const paymentMethods = [
  { id: 'credit_card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' },
  { id: 'wallet', label: 'Wallet Balance', icon: '👛' },
]

export default function CheckoutPage() {
  const router = useRouter()

  const { user } = useAuthStore()
  const { items, getSubtotal, clearCart } = useCartStore()

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('credit_card')

  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null)

  const { register, handleSubmit, getValues } = useForm<CheckoutForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zip: user?.address?.zip || '',
      country: user?.address?.country || 'USA',
    },
  })

  const subtotal = getSubtotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handlePlaceOrder = async (data: CheckoutForm) => {
    setLoading(true)

    try {
      const orderId = generateOrderId()

      // ✅ image مضافة
      const orderItems: OrderItem[] = items.map(i => ({
        productId: i.productId,
        name: i.product?.name || '',
        quantity: i.quantity,
        price: i.price,
        image: i.product?.images?.[0] || '',
      }))

      const orderData: Partial<Order> = {
        id: orderId,
        userId: user?.id || 'guest',
        sellerId: '1',
        items: orderItems,
        subtotal,
        discount: 0,
        shipping,
        tax,
        total,
        promoCode: null,
        paymentMethod,
        paymentStatus:
          paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
        shippingAddress: {
          name: data.name,
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
        },
        status: 'placed',
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date().toISOString(),
            note: 'Order placed successfully',
          },
        ],
        createdAt: new Date().toISOString(),
      }

      await orderApi.create(orderData)

      const customerEmail = data.email || user?.email

      if (!customerEmail) {
        toast.error('Email is required for confirmation')
        return
      }

      await sendOrderConfirmationEmail(
        user?.name || data.name || 'Customer',
        customerEmail,
        orderId,
        total,
        orderItems
      )

      clearCart()
      setOrderPlaced(orderId)
      toast.success('Order placed successfully 🎉')
    } catch (err) {
      console.error(err)
      toast.error('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeSuccess = () => {
    const data = getValues()
    if (!data.email) {
      toast.error('Email is required')
      return
    }
    handlePlaceOrder(data)
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold">Order Placed!</h1>
          <p className="text-gray-500 mt-2">ID: <span className="font-bold text-orange-500">{orderPlaced}</span></p>
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => router.push('/orders')}
              className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90">
              Track Order
            </button>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 border-2 border-orange-200 text-orange-500 rounded-2xl font-bold hover:bg-orange-50">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 p-4">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* ADDRESS */}
          <div className="bg-white p-6 rounded-2xl card-shadow">
            <h2 className="font-bold mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name</label>
                <input placeholder="John Doe"
                  {...register('name', { required: true })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
                <input placeholder="you@example.com"
                  {...register('email', { required: true })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Street</label>
                <input placeholder="123 Main St"
                  {...register('street')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">City</label>
                <input placeholder="New York"
                  {...register('city')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">State</label>
                <input placeholder="NY"
                  {...register('state')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">ZIP</label>
                <input placeholder="10001"
                  {...register('zip')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Country</label>
                <input placeholder="USA"
                  {...register('country')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white p-6 rounded-2xl card-shadow">
            <h2 className="font-bold mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {paymentMethods.map(m => (
                <label key={m.id}
                  className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-colors
                    ${paymentMethod === m.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" hidden
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id as PaymentMethod)} />
                  <span>{m.icon}</span>
                  <span className="text-sm font-medium">{m.label}</span>
                </label>
              ))}
            </div>

            {/* STRIPE */}
            {paymentMethod === 'credit_card' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <StripePayment
                  amount={total}
                  onSuccess={handleStripeSuccess}
                />
              </div>
            )}

            {/* CASH / OTHER */}
            {paymentMethod !== 'credit_card' && (
              <button
                onClick={handleSubmit(handlePlaceOrder)}
                disabled={loading}
                className="w-full mt-4 py-3.5 gradient-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Place Order • ${formatPrice(total)}`
                )}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT - Summary */}
        <div className="bg-white p-6 rounded-2xl card-shadow h-fit">
          <h2 className="font-bold mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4">
            {items.map(i => (
              <div key={i.productId} className="flex gap-3">
                <img
                  src={i.product?.images?.[0] || ''}
                  alt={i.product?.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium line-clamp-2">{i.product?.name}</p>
                  <p className="text-xs text-gray-500">x{i.quantity}</p>
                  <p className="text-sm font-bold text-orange-500">{formatPrice(i.price * i.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span><span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-black text-base pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-orange-500">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}