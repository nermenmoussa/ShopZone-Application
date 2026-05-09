'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  SlidersHorizontal,
  Grid,
  List,
  X,
} from 'lucide-react'

import { productApi, categoryApi } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'

import type { FilterOptions } from '@/types'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'popular', label: 'Most Popular' },
]

export default function ProductsPageClient() {

  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<FilterOptions>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: 'newest',
  })

  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  })

  // All products
  const {
    data: allProducts = [],
    isLoading,
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(),
  })

  // Handle filter change
  const handleFilterChange = (
    key: keyof FilterOptions,
    value: string | number | undefined
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Apply price filter
  const applyPriceFilter = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: minPrice
        ? Number(minPrice)
        : undefined,

      maxPrice: maxPrice
        ? Number(maxPrice)
        : undefined,
    }))
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      sortBy: 'newest',
    })

    setMinPrice('')
    setMaxPrice('')
  }

  // Filtered products
  const filteredProducts = useMemo(() => {

    return allProducts.filter((product: any) => {

      // Search
      const matchesSearch =
        !filters.search ||
        product.name
          .toLowerCase()
          .includes(filters.search.toLowerCase())

      // Category
      const matchesCategory =
        !filters.category ||
        product.categoryId === filters.category

      // Min price
      const matchesMinPrice =
        !filters.minPrice ||
        product.price >= filters.minPrice

      // Max price
      const matchesMaxPrice =
        !filters.maxPrice ||
        product.price <= filters.maxPrice

      // Rating
      const matchesRating =
        !filters.rating ||
        product.rating >= filters.rating

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesRating
      )
    })

  }, [allProducts, filters])

  // Sorted products
  const sortedProducts = useMemo(() => {

    return [...filteredProducts].sort((a: any, b: any) => {

      switch (filters.sortBy) {

        case 'price_asc':
          return a.price - b.price

        case 'price_desc':
          return b.price - a.price

        case 'rating':
          return b.rating - a.rating

        case 'popular':
          return b.reviewCount - a.reviewCount

        default:
          return 0
      }
    })

  }, [filteredProducts, filters.sortBy])

  const activeFilterCount = [
    filters.category,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length

  return (
    <div
      className="min-h-screen"
      style={{ paddingTop: '88px' }}
    >

      {/* Header */}
      <div className="bg-white border-b border-gray-100">

        <div className="max-w-7xl mx-auto px-4 py-5">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-black">

                {filters.search
                  ? `Results for "${filters.search}"`
                  : 'All Products'}

              </h1>

              <p className="text-gray-500 text-sm mt-0.5">

                {isLoading
                  ? 'Loading...'
                  : `${sortedProducts.length} products found`}

              </p>

            </div>

            <div className="flex items-center gap-3">

              {/* View mode */}
              <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">

                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${
                    viewMode === 'grid'
                      ? 'bg-orange-500 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Grid size={16} />
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${
                    viewMode === 'list'
                      ? 'bg-orange-500 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <List size={16} />
                </button>

              </div>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={e =>
                  handleFilterChange(
                    'sortBy',
                    e.target.value as FilterOptions['sortBy']
                  )
                }
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
              >

                {sortOptions.map(opt => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}

              </select>

              {/* Filters button */}
              <button
                onClick={() =>
                  setShowFilters(!showFilters)
                }
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-orange-400 transition-colors relative"
              >

                <SlidersHorizontal size={16} />

                Filters

                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 gradient-primary text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}

              </button>

            </div>

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex gap-8">

          {/* Sidebar */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-64 shrink-0`}
          >

            <div className="bg-white rounded-2xl p-5 card-shadow sticky top-28">

              <div className="flex items-center justify-between mb-5">

                <h3 className="font-bold">
                  Filters
                </h3>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-orange-500 hover:underline flex items-center gap-1"
                  >
                    <X size={12} />
                    Clear all
                  </button>
                )}

              </div>

              {/* Search */}
              <div className="mb-5">

                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Search
                </label>

                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search || ''}
                  onChange={e =>
                    handleFilterChange(
                      'search',
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                />

              </div>

              {/* Categories */}
              <div className="mb-5">

                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Category
                </label>

                <div className="space-y-1.5">

                  <label className="flex items-center gap-2 cursor-pointer">

                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!filters.category}
                      onChange={() =>
                        handleFilterChange(
                          'category',
                          ''
                        )
                      }
                      className="accent-orange-500"
                    />

                    <span className="text-sm">
                      All Categories
                    </span>

                  </label>

                  {categories
                    ?.filter((c: any) => !c.parentId)
                    .map((cat: any) => (

                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >

                        <input
                          type="radio"
                          name="category"
                          value={cat.id}
                          checked={
                            filters.category === cat.id
                          }
                          onChange={() =>
                            handleFilterChange(
                              'category',
                              cat.id
                            )
                          }
                          className="accent-orange-500"
                        />

                        <span className="text-sm">
                          {cat.icon} {cat.name}
                        </span>

                      </label>
                    ))}

                </div>

              </div>

              {/* Price */}
              <div className="mb-5">

                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Price Range
                </label>

                <div className="flex gap-2 items-center">

                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e =>
                      setMinPrice(e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />

                  <span className="text-gray-400 text-xs">
                    to
                  </span>

                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e =>
                      setMaxPrice(e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />

                </div>

                <button
                  onClick={applyPriceFilter}
                  className="mt-2 w-full py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Apply
                </button>

              </div>

            </div>

          </aside>

          {/* Products */}
          <div className="flex-1">

            {isLoading ? (

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">

                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl aspect-[3/4] animate-pulse"
                  />
                ))}

              </div>

            ) : sortedProducts.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-20 text-center">

                <div className="text-6xl mb-4">
                  🔍
                </div>

                <h3 className="font-bold text-xl mb-2">
                  No products found
                </h3>

                <p className="text-gray-500 mb-5">
                  Try adjusting your filters
                </p>

                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium"
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">

                {sortedProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  )
}