'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, Heart, User, Search, Menu, X, Bell,
  ChevronDown, LogOut, Package, Shield, Store
} from 'lucide-react'

import { useCartStore, useUIStore, useWishlistStore } from '@/store'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/deals', label: '🔥 Deals' },
  { href: '/sellers', label: 'Sellers' },
]

export function Navbar() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const { data: session, status } = useSession()

  const { getItemCount } = useCartStore()
  const { productIds } = useWishlistStore()
  const { isCartOpen, setCartOpen, isMobileMenuOpen, setMobileMenuOpen } = useUIStore()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
    setUserMenuOpen(false)
  }

  // 🚨 يمنع hydration mismatch
  if (!mounted) return null

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-md'
    )}>

      {/* Top bar (زي ما هو) */}
      <div className="gradient-primary text-white text-xs py-1.5 text-center">
        🎉 Free shipping on orders over $100 | Use code <span className="font-bold">NEWUSER</span>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">

          {/* Logo (زي ما هو) */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="font-bold text-xl hidden sm:block">
              Shop<span className="text-gradient">Zone</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="flex w-full border-2 border-orange-200 rounded-xl overflow-hidden focus-within:border-orange-400 transition-colors">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
              />
              <button className="px-4 gradient-primary text-white">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 rounded-lg hover:bg-gray-100">
              <Heart size={20} />
              {productIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 gradient-primary text-white text-xs rounded-full flex items-center justify-center">
                  {productIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(!isCartOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <ShoppingCart size={20} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-primary text-white text-xs rounded-full flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>

            {/* USER */}
            {status === 'loading' ? null : session?.user ? (
              <div className="relative">

                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`}
                    className="w-8 h-8 rounded-full border-2 border-orange-200"
                  />
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border py-2 z-50">

                    <div className="px-4 py-2 border-b">
                      <p className="font-semibold text-sm">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>

                    <Link href="/profile" className="flex gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                      <User size={16} /> My Profile
                    </Link>

                    <Link href="/orders" className="flex gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                      <Package size={16} /> My Orders
                    </Link>

                    <Link href="/notifications" className="flex gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                      <Bell size={16} /> Notifications
                    </Link>

                    {session.user.role === 'seller' && (
                      <Link href="/seller/dashboard" className="flex gap-3 px-4 py-2 hover:bg-gray-50 text-sm">
                        <Store size={16} /> Seller Dashboard
                      </Link>
                    )}

                    {session.user.role === 'admin' && (
                      <Link href="/admin" className="flex gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-purple-600">
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}

                    <div className="border-t mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex gap-3 px-4 py-2 text-red-500 text-sm w-full"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-orange-500">
                  Sign In
                </Link>
                <Link href="/auth/register" className="text-sm font-semibold px-4 py-2 gradient-primary text-white rounded-xl">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>

          </div>
        </div>
      </div>
    </header>
  )
}