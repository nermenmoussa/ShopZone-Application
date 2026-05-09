'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Tag } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store'
import { promoApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState('')
  const router = useRouter()

  const subtotal = getSubtotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const discountAmount = discount
  const tax = (subtotal - discountAmount) * 0.08
  const total = subtotal - discountAmount + shipping + tax

  const handleApplyPromo = async () => {
    try {
      const promo = await promoApi.getByCode(promoCode.toUpperCase())
      if (!promo) { toast.error('Invalid or expired code'); return }
      if (subtotal < promo.minOrder) { toast.error(`Min. order $${promo.minOrder} required`); return }
      const disc = promo.type === 'percentage' ? (subtotal * promo.value / 100) : promo.type === 'fixed' ? promo.value : 0
      setDiscount(disc)
      setPromoApplied(promo.code)
      toast.success(`Code applied! ${promo.type === 'shipping' ? 'Free shipping' : formatPrice(disc) + ' off'}`)
    } catch {
      toast.error('Could not apply code')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: '88px' }}>
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some amazing products!</p>
        <Link href="/products" className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black">Shopping Cart</h1>
          <span className="text-gray-500 text-sm">({items.length} items)</span>
          <button onClick={() => { clearCart(); toast('Cart cleared') }}
            className="ml-auto text-xs text-red-400 hover:underline">Clear Cart</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.productId} className="bg-white rounded-2xl p-5 card-shadow flex gap-4">
                <Link href={`/products/${item.productId}`}>
                  <img src={item.product?.images?.[0]} alt={item.product?.name}
                    className="w-24 h-24 rounded-xl object-cover hover:opacity-90 transition-opacity" />
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-orange-500 font-medium">{item.product?.brand}</p>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-sm mt-0.5 hover:text-orange-500 transition-colors line-clamp-2">
                          {item.product?.name}
                        </h3>
                      </Link>
                    </div>
                    <button onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-orange-500">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 card-shadow">
              <h2 className="font-bold mb-4">Order Summary</h2>

              {/* Promo */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter promo code"
                    value={promoCode} onChange={e => setPromoCode(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                  <button onClick={handleApplyPromo}
                    className="px-3 gradient-primary text-white rounded-xl text-sm font-medium">
                    <Tag size={14} />
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 font-medium mt-1.5">✓ {promoApplied} applied!</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Try: SAVE20, FLAT50, NEWUSER</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span><span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span><span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-black text-base pt-2.5 border-t border-gray-100">
                  <span>Total</span><span className="text-orange-500">{formatPrice(total)}</span>
                </div>
              </div>

              {subtotal < 100 && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Add {formatPrice(100 - subtotal)} more for free shipping!
                </p>
              )}

              <Link href="/checkout"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 gradient-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity">
                <ShoppingCart size={18} /> Proceed to Checkout
              </Link>
              <Link href="/products"
                className="mt-2 flex items-center justify-center w-full py-2.5 text-orange-500 text-sm font-medium hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
