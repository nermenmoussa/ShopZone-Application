'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { categoryApi } from '@/lib/api'

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  })

  const topLevel = categories?.filter(c => !c.parentId) || []

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black">All Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Browse by category to find what you need</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {topLevel.map(cat => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden h-48 card-shadow hover-lift">
                <img src={cat.image} alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <h3 className="font-bold text-white">{cat.name}</h3>
                  <p className="text-gray-300 text-xs mt-0.5">{cat.productCount} products</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
