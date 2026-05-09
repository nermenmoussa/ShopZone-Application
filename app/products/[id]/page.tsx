'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Plus,
  Minus,
  ChevronRight,
  Package,
} from 'lucide-react'

import { productApi, reviewApi } from '@/lib/api'
import {
  useCartStore,
  useWishlistStore,
  useAuthStore,
} from '@/store'

import {
  formatPrice,
  formatDate,
} from '@/lib/utils'

import { ProductCard } from '@/components/product/ProductCard'

import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const [activeTab, setActiveTab] = useState<
    'desc' | 'specs' | 'reviews'
  >('desc')

  const { addItem } = useCartStore()

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlistStore()

  const { user } = useAuthStore()

  const inWishlist = isInWishlist(id)

  // Product
  const {
    data: product,
    isLoading,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
  })

  // Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewApi.getByProduct(id),
    enabled: !!id,
  })

  // All products
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(),
  })

  // Related products
  const relatedProducts = allProducts.filter(
    (p: any) =>
      p.categoryId === product?.categoryId &&
      p.id !== product?.id
  )

  // Loading
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ paddingTop: '88px' }}
      >
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not found
  if (!product) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ paddingTop: '88px' }}
      >
        <div className="text-6xl mb-4">😕</div>

        <h2 className="text-2xl font-bold mb-2">
          Product Not Found
        </h2>

        <button
          onClick={() => router.push('/products')}
          className="mt-4 px-6 py-2.5 gradient-primary text-white rounded-xl"
        >
          Back to Products
        </button>
      </div>
    )
  }

  // Add to cart
  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart!`)
  }

  // Buy now
  const handleBuyNow = () => {
    addItem(product, quantity)
    router.push('/checkout')
  }

  // Wishlist
  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
      toast('Removed from wishlist')
    } else {
      addToWishlist(product.id)
      toast.success('Added to wishlist!')
    }
  }

  const savings =
    product.originalPrice - product.price

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ paddingTop: '88px' }}
    >
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1 text-sm text-gray-500">

          <button
            onClick={() => router.push('/')}
            className="hover:text-orange-500"
          >
            Home
          </button>

          <ChevronRight size={14} />

          <button
            onClick={() => router.push('/products')}
            className="hover:text-orange-500"
          >
            Products
          </button>

          <ChevronRight size={14} />

          <span className="text-gray-800 font-medium truncate">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* Images */}
          <div>

            <div className="bg-white rounded-3xl overflow-hidden mb-3 aspect-square">

              {product.images?.[selectedImage] && (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}

            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2">

                {product.images.map(
                  (img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors
                      ${
                        selectedImage === i
                          ? 'border-orange-500'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt="product-image"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                )}

              </div>
            )}
          </div>

          {/* Product Info */}
          <div>

            <div className="flex items-start justify-between mb-3">

              <span className="text-orange-500 font-semibold text-sm">
                {product.brand}
              </span>

              <button
                onClick={handleWishlist}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Heart
                  size={20}
                  className={
                    inWishlist
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400'
                  }
                />
              </button>

            </div>

            <h1 className="text-2xl font-black mb-3 leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">

              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i <= Math.round(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200 fill-gray-200'
                    }
                  />
                ))}
              </div>

              <span className="font-bold text-sm">
                {product.rating}
              </span>

              <span className="text-gray-500 text-sm">
                ({product.reviewCount} reviews)
              </span>

            </div>

            {/* Price */}
            <div className="bg-orange-50 rounded-2xl p-4 mb-5">

              <div className="flex items-end gap-3">

                <span className="text-3xl font-black text-gray-900">
                  {formatPrice(product.price)}
                </span>

                {product.discount > 0 && (
                  <>
                    <span className="text-gray-400 line-through text-lg">
                      {formatPrice(product.originalPrice)}
                    </span>

                    <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-lg">
                      -{product.discount}%
                    </span>
                  </>
                )}

              </div>

              {savings > 0 && (
                <p className="text-green-600 text-sm font-medium mt-1">
                  You save {formatPrice(savings)}!
                </p>
              )}

            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">

              <Package
                size={16}
                className={
                  product.stock > 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }
              />

              <span
                className={`text-sm font-medium ${
                  product.stock > 0
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {product.stock > 0
                  ? product.stock <= 5
                    ? `Only ${product.stock} left in stock!`
                    : 'In Stock'
                  : 'Out of Stock'}
              </span>

            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">

              <span className="text-sm font-semibold">
                Quantity:
              </span>

              <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">

                <button
                  onClick={() =>
                    setQuantity(q => Math.max(1, q - 1))
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus size={14} />
                </button>

                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(q =>
                      Math.min(product.stock, q + 1)
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus size={14} />
                </button>

              </div>

              <span className="text-sm text-gray-500">
                Max: {product.stock}
              </span>

            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>

            <h2 className="text-xl font-black mb-5">
              Related Products
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

              {relatedProducts
                .slice(0, 4)
                .map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

            </div>

          </div>
        )}

      </div>
    </div>
  )
}