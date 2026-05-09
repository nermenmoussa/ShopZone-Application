'use client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { sellerApi, userApi, productApi } from '@/lib/api'
import { Star, Package, ShoppingBag, Store } from 'lucide-react'

export default function SellersPage() {
  const router = useRouter()

  const { data: sellers, isLoading } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellerApi.getAll,
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  })

  const { data: products } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productApi.getAll(),
  })

  const approvedSellers = sellers?.filter(s => s.isApproved) || []

  const getUser = (userId: string) => users?.find(u => u.id === userId)
  const getProductCount = (sellerId: string) =>
    products?.filter(p => p.sellerId === sellerId).length || 0

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-2 mb-4">
            <Store size={16} className="text-orange-500" />
            <span className="text-orange-500 text-sm font-semibold">Trusted Sellers</span>
          </div>
          <h1 className="text-3xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Meet Our Sellers
          </h1>
          <p className="text-gray-500">
            Discover amazing stores and shop directly from verified sellers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Active Sellers', value: approvedSellers.length, icon: Store, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Total Products', value: products?.length || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Happy Customers', value: '10K+', icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 card-shadow text-center">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sellers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : approvedSellers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="font-bold text-xl mb-2">No sellers yet</h3>
            <p className="text-gray-500 mb-6">Be the first to sell on ShopZone!</p>
            <button
              onClick={() => router.push('/auth/register')}
              className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90">
              Become a Seller
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedSellers.map(seller => {
              const user = getUser(seller.userId)
              const productCount = getProductCount(seller.id)

              return (
                <div key={seller.id}
                  className="bg-white rounded-2xl overflow-hidden card-shadow hover-lift cursor-pointer"
                  onClick={() => router.push(`/products?seller=${seller.id}`)}>

                  {/* Banner */}
                  <div className="h-24 gradient-dark relative">
                    <div className="absolute inset-0 opacity-20"
                      style={{ background: 'radial-gradient(circle at 70% 50%, #FF6B35, transparent)' }} />
                  </div>

                  {/* Content */}
                  <div className="px-5 pb-5">
                    {/* Avatar */}
                    <div className="-mt-8 mb-3">
                      <img
                        src={seller.logo || user?.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${seller.storeName}`}
                        alt={seller.storeName}
                        className="w-16 h-16 rounded-2xl border-4 border-white object-cover"
                      />
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-black text-lg">{seller.storeName}</h3>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                          {seller.storeDescription}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2">
                        ✓ Verified
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'Products', value: productCount },
                        { label: 'Sales', value: seller.totalSales },
                        { label: 'Rating', value: seller.rating > 0 ? `⭐ ${seller.rating}` : 'New' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <p className="font-black text-sm">{stat.value}</p>
                          <p className="text-gray-400 text-xs">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      className="w-full py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                      Visit Store
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Become a Seller CTA */}
        <div className="mt-12 gradient-dark rounded-3xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(circle at 30% 50%, #FF6B35, transparent)' }} />
          <div className="relative">
            <h2 className="text-2xl font-black mb-3">Want to Sell on ShopZone?</h2>
            <p className="text-gray-300 mb-6 text-sm">
              Join thousands of sellers and reach millions of customers
            </p>
            <button
              onClick={() => router.push('/auth/register')}
              className="px-8 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity">
              Start Selling Today 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}