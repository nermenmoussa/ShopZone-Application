'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore, useUIStore } from '@/store'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const { isCartOpen, setCartOpen } = useUIStore()
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore()

  const subtotal = getSubtotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-500" />
            <h2 className="font-bold text-lg">Your Cart</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {getItemCount()}
            </span>
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mb-5">Add some items to get started!</p>
              <button onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
                <img
                  src={item.product?.images?.[0] || '/placeholder.jpg'}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2 mb-1">{item.product?.name}</p>
                  <p className="text-orange-500 font-bold text-sm">{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="space-y-1.5 text-sm">
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
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-orange-500">{formatPrice(total)}</span>
              </div>
            </div>
            {subtotal < 100 && (
              <p className="text-xs text-gray-500 text-center">
                Add {formatPrice(100 - subtotal)} more for free shipping!
              </p>
            )}
            <Link href="/checkout" onClick={() => setCartOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/cart" onClick={() => setCartOpen(false)}
              className="flex items-center justify-center w-full py-2.5 border-2 border-orange-200 text-orange-500 rounded-xl font-medium hover:bg-orange-50 transition-colors text-sm">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
