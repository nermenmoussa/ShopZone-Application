import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, CartItem, Product } from '@/types'

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => {
        if (typeof window !== 'undefined') {
          if (user) {
            document.cookie = `shopzone-user=${JSON.stringify({ id: user.id, role: user.role })}; path=/; max-age=604800`
          } else {
            document.cookie = 'shopzone-user=; path=/; max-age=0'
          }
        }
        set({ user })
      },
      setToken: (token) => set({ token }),
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'shopzone-user=; path=/; max-age=0'
        }
        set({ user: null, token: null })
      },
    }),
    { name: 'shopzone-auth' }
  )
)

// ─── Cart Store ───────────────────────────────────────────────────────────────
interface CartState {
  items: (CartItem & { product: Product })[]
  cartId: string | null
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCartId: (id: string) => void
  getTotal: () => number
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(i => i.productId === product.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            }
          }
          return {
            items: [...state.items, { productId: product.id, quantity, price: product.price, product }]
          }
        })
      },

      removeItem: (productId) => {
        set(state => ({ items: state.items.filter(i => i.productId !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          )
        }))
      },

      clearCart: () => set({ items: [], cartId: null }),
      setCartId: (id) => set({ cartId: id }),

      getSubtotal: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const shipping = subtotal > 100 ? 0 : 9.99
        const tax = subtotal * 0.08
        return subtotal + shipping + tax
      },

      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    { name: 'shopzone-cart' }
  )
)

// ─── Wishlist Store ───────────────────────────────────────────────────────────
interface WishlistState {
  productIds: string[]
  wishlistId: string | null
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  setWishlistId: (id: string) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      wishlistId: null,

      addToWishlist: (productId) => {
        set(state => ({ productIds: [...new Set([...state.productIds, productId])] }))
      },

      removeFromWishlist: (productId) => {
        set(state => ({ productIds: state.productIds.filter(id => id !== productId) }))
      },

      isInWishlist: (productId) => get().productIds.includes(productId),

      setWishlistId: (id) => set({ wishlistId: id }),
    }),
    { name: 'shopzone-wishlist' }
  )
)

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UIState {
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  setCartOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}))
