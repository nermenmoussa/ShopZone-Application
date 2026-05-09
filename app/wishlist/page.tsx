'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Heart, Trash2 } from 'lucide-react'
import { productApi } from '@/lib/api'
import { useWishlistStore, useCartStore } from '@/store'
import { ProductCard } from '@/components/product/ProductCard'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { productIds, removeFromWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  const { data: allProducts } = useQuery({
    queryKey: ['all-products-wishlist'],
    queryFn: () => productApi.getAll(),
  })

  const wishlistProducts = allProducts?.filter(p => productIds.includes(p.id)) || []

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Heart size={24} className="text-red-500" /> My Wishlist
            </h1>
            <p className="text-gray-500 text-sm mt-1">{wishlistProducts.length} saved items</p>
          </div>
          {wishlistProducts.length > 0 && (
            <button
              onClick={() => {
                wishlistProducts.forEach(p => addItem(p))
                toast.success('All items added to cart!')
              }}
              className="px-5 py-2.5 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Add All to Cart
            </button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center card-shadow">
            <Heart size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save products you love and shop them later</p>
            <Link href="/products" className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlistProducts.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={() => { removeFromWishlist(product.id); toast('Removed from wishlist') }}
                  className="absolute top-12 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
