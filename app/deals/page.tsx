'use client'

import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { Tag, Clock } from 'lucide-react'
import type { Product } from '@/types'

export default function DealsPage() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['deals'],
    queryFn: () => productApi.getAll(), // ✅ arrow function بدل مباشر
  })

  // ✅ بدون useMemo
  const deals = products
    .filter(p => (p.discount ?? 0) > 0)
    .sort((a: Product, b: Product) => (b.discount ?? 0) - (a.discount ?? 0))

  const hotDeals = deals.filter(p => (p.discount ?? 0) >= 15)
  const regularDeals = deals.filter(p => (p.discount ?? 0) < 15)
  const featured = hotDeals[0]

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>

      {/* HERO */}
      <div className="gradient-dark text-white py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-4">
            <Tag size={16} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-semibold">
              Limited Time Offers
            </span>
          </div>

          <h1 className="text-4xl font-black mb-3">
            Today is Best Deals 🔥
          </h1>

          <p className="text-gray-300 text-lg">
            Grab these amazing discounts before they are gone!
          </p>

          <div className="flex items-center justify-center gap-2 mt-6 text-orange-400">
            <Clock size={18} />
            <span className="text-sm font-semibold">Deals refresh daily</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>

        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="font-bold text-xl mb-2">No deals right now</h3>
            <p className="text-gray-500">Check back soon for amazing offers!</p>
          </div>

        ) : (
          <>
            {/* HOT DEALS */}
            {hotDeals.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <h2 className="text-xl font-black">Hot Deals</h2>
                    <p className="text-gray-500 text-sm">15% off or more!</p>
                  </div>
                  <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                    {hotDeals.length}
                  </span>
                </div>

                {/* Featured */}
                {featured && (
                  <div className="relative rounded-3xl overflow-hidden h-56 mb-5 group">
                    <img
                      src={featured.images?.[0] || '/placeholder.png'}
                      alt={featured.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <div className="absolute inset-0 flex items-center px-8">
                      <div>
                        <span className="bg-red-500 text-white text-sm font-black px-3 py-1 rounded-xl">
                          -{featured.discount ?? 0}%
                        </span>
                        <h3 className="text-white text-2xl font-black mt-3">
                          {featured.name}
                        </h3>
                        <div className="flex gap-3 mt-2">
                          <span className="text-white font-black text-xl">
                            ${featured.price ?? 0}
                          </span>
                          <span className="text-gray-300 line-through">
                            ${featured.originalPrice ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {hotDeals.slice(1).map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* REGULAR DEALS */}
            {regularDeals.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h2 className="text-xl font-black">More Deals</h2>
                    <p className="text-gray-500 text-sm">Still great savings!</p>
                  </div>
                  <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                    {regularDeals.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {regularDeals.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}