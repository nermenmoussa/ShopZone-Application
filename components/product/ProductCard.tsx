'use client'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react'
import { useCartStore, useWishlistStore, useAuthStore } from '@/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore()
  const { user } = useAuthStore()
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast('Removed from wishlist')
    } else {
      addToWishlist(product.id)
      toast.success('Added to wishlist!')
    }
  }

  const isLowStock = product.stock > 0 && product.stock <= 5
  const isOutOfStock = product.stock === 0

  return (
    <Link href={`/products/${product.id}`}
      className={cn('group bg-white rounded-2xl overflow-hidden card-shadow hover-lift block', className)}>
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{product.discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Zap size={10} /> Featured
            </span>
          )}
          {isLowStock && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              Only {product.stock} left!
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform">
          <Heart size={14} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>

        {/* Quick add to cart */}
        {!isOutOfStock && (
          <button onClick={handleAddToCart}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-xl 
                       opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 
                       whitespace-nowrap flex items-center gap-1.5">
            <ShoppingCart size={12} /> Add to Cart
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-orange-500 font-medium mb-1">{product.brand}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 text-gray-800">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11}
                className={i <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.discount > 0 && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
