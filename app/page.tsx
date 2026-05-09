'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Star, TrendingUp } from 'lucide-react'
import { bannerApi, categoryApi, productApi } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { formatPrice } from '@/lib/utils'

function HeroBanner() {
  const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: bannerApi.getAll })
  const banner = banners?.[0]

  return (
    <section className="relative min-h-[580px] flex items-center overflow-hidden" style={{ marginTop: '88px' }}>
      <div className="absolute inset-0">
        <img src={banner?.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200'}
          alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-xl">
          <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 animate-fade-in">
            🔥 Limited Time Offer
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight animate-fade-in"
            style={{ animationDelay: '0.1s', fontFamily: 'Playfair Display, serif' }}>
            {banner?.title || 'Summer Sale'}
            <span className="block text-orange-400">Up to 50% Off</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {banner?.subtitle || 'Shop the biggest deals of the season'}
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link href={banner?.link || '/products'}
              className="flex items-center gap-2 px-7 py-3.5 gradient-primary text-white rounded-2xl font-bold text-base hover:opacity-90 transition-opacity">
              {banner?.buttonText || 'Shop Now'} <ArrowRight size={18} />
            </Link>
            <Link href="/categories"
              className="flex items-center gap-2 px-7 py-3.5 bg-white/20 backdrop-blur text-white rounded-2xl font-bold text-base hover:bg-white/30 transition-colors border border-white/30">
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustBadges() {
  const badges = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
  ]
  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryGrid() {
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryApi.getAll })
  const topCategories = categories?.filter(c => !c.parentId).slice(0, 8) || []

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Shop by Category</h2>
          <p className="text-gray-500 text-sm mt-1">Find exactly what you're looking for</p>
        </div>
        <Link href="/categories" className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:gap-2 transition-all">
          View All <ArrowRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {topCategories.map(cat => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl card-shadow hover-lift text-center">
            <div className="text-3xl">{cat.icon}</div>
            <span className="text-xs font-semibold text-gray-700 leading-tight">{cat.name}</span>
            <span className="text-xs text-gray-400">{cat.productCount} items</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function FeaturedProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: productApi.getFeatured,
  })

  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={20} className="text-orange-500" />
              <span className="text-orange-500 font-semibold text-sm">Trending Now</span>
            </div>
            <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Featured Products</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:gap-2 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PromoSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative rounded-3xl overflow-hidden h-56 group cursor-pointer">
          <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800"
            alt="Electronics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <p className="text-blue-200 text-sm font-semibold mb-1">Up to 40% off</p>
              <h3 className="text-white text-2xl font-black mb-3">Electronics Sale</h3>
              <Link href="/categories/electronics"
                className="inline-flex items-center gap-2 bg-white text-blue-900 text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden h-56 group cursor-pointer">
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
            alt="Fashion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/80 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <p className="text-pink-200 text-sm font-semibold mb-1">New Arrivals</p>
              <h3 className="text-white text-2xl font-black mb-3">Fashion Week</h3>
              <Link href="/categories/fashion"
                className="inline-flex items-center gap-2 bg-white text-pink-900 text-sm font-bold px-5 py-2 rounded-xl hover:bg-pink-50 transition-colors">
                Explore <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AllProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productApi.getAll({ limit: 8 }),
  })

  return (
    <section className="bg-gray-50 py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Latest Products</h2>
            <p className="text-gray-500 text-sm mt-1">Fresh arrivals just for you</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:gap-2 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    { name: 'Sarah M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', rating: 5, text: 'Amazing selection and super fast delivery! I\'ve been shopping here for 2 years now.' },
    { name: 'John D.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', rating: 5, text: 'Best prices anywhere. The customer support is incredibly responsive too.' },
    { name: 'Emma L.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', rating: 5, text: 'Love the app! So easy to track orders and the return process is seamless.' },
  ]
  return (
    <section className="bg-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>What Our Customers Say</h2>
          <p className="text-gray-500 text-sm mt-2">Trusted by millions of shoppers worldwide</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6">
              <div className="flex mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <TrustBadges />
      <CategoryGrid />
      <FeaturedProducts />
      <PromoSection />
      <AllProducts />
      <TestimonialsSection />
    </>
  )
}
