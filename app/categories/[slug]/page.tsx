'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { categoryApi, productApi } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  // Get current category
  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryApi.getBySlug(slug),
  })

  // Get all categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  // Get all products
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(),
  })

  // Filter products by category + subcategories
  const filteredProducts = useMemo(() => {
    if (!category) return []

    // child categories
    const childCategoryIds = categories
      .filter((cat: any) => cat.parentId === category.id)
      .map((cat: any) => cat.id)

    // include parent + children
    return allProducts.filter((product: any) => {
      return (
        product.categoryId === category.id ||
        childCategoryIds.includes(product.categoryId)
      )
    })
  }, [allProducts, categories, category])

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
{category?.image && (
  <img
    src={category.image}
    alt={category.name}
    className="w-full h-full object-cover"
  />
)}

        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent" />

        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="text-4xl mb-1">
              {category?.icon}
            </div>

            <h1 className="text-3xl font-black text-white">
              {category?.name}
            </h1>

            <p className="text-gray-300 text-sm mt-1">
              {filteredProducts.length} products
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl aspect-3/4 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>

            <h3 className="font-bold text-xl mb-2">
              No products in this category
            </h3>

            <p className="text-gray-500">
              Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}