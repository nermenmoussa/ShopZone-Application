import axios from 'axios'
import type {
  User, Product, Category, Order, Cart, Wishlist,
  Review, PromoCode, Banner, Notification, Wallet,
  Seller, FilterOptions
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({ baseURL: API_URL })

// ─── Users ───────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get<User[]>('/users').then(r => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then(r => r.data),
  getByEmail: (email: string) =>
    api.get<User[]>(`/users?email=${email}`).then(r => r.data[0]),
  create: (data: Partial<User>) => api.post<User>('/users', data).then(r => r.data),
  update: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/users/${id}`),
  softDelete: (id: string) => api.patch(`/users/${id}`, { isActive: false }),
}

// ─── Sellers ─────────────────────────────────────────────────────────────────
export const sellerApi = {
  getAll: () => api.get<Seller[]>('/sellers').then(r => r.data),
  getById: (id: string) => api.get<Seller>(`/sellers/${id}`).then(r => r.data),
  getByUserId: (userId: string) =>
    api.get<Seller[]>(`/sellers?userId=${userId}`).then(r => r.data[0]),
  create: (data: Partial<Seller>) => api.post<Seller>('/sellers', data).then(r => r.data),
  update: (id: string, data: Partial<Seller>) =>
    api.patch<Seller>(`/sellers/${id}`, data).then(r => r.data),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get<Category[]>('/categories').then(r => r.data),
  getBySlug: (slug: string) =>
    api.get<Category[]>(`/categories?slug=${slug}`).then(r => r.data[0]),
  getById: (id: string) => api.get<Category>(`/categories/${id}`).then(r => r.data),
  create: (data: Partial<Category>) =>
    api.post<Category>('/categories', data).then(r => r.data),
  update: (id: string, data: Partial<Category>) =>
    api.patch<Category>(`/categories/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// ─── Products ────────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (filters?: FilterOptions & { page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('name_like', filters.search)
    if (filters?.category) params.append('categoryId', filters.category)
    if (filters?.sortBy === 'price_asc') params.append('_sort', 'price')
    if (filters?.sortBy === 'price_desc') { params.append('_sort', 'price'); params.append('_order', 'desc') }
    if (filters?.sortBy === 'newest') { params.append('_sort', 'createdAt'); params.append('_order', 'desc') }
    if (filters?.page) params.append('_page', String(filters.page))
    if (filters?.limit) params.append('_limit', String(filters.limit))
    params.append('isActive', 'true')
    return api.get<Product[]>(`/products?${params}`).then(r => r.data)
  },
  getFeatured: () =>
    api.get<Product[]>('/products?isFeatured=true&isActive=true').then(r => r.data),
  getById: (id: string) => api.get<Product>(`/products/${id}`).then(r => r.data),
  getBySlug: (slug: string) =>
    api.get<Product[]>(`/products?slug=${slug}`).then(r => r.data[0]),
  getBySeller: (sellerId: string) =>
    api.get<Product[]>(`/products?sellerId=${sellerId}`).then(r => r.data),
  create: (data: Partial<Product>) =>
    api.post<Product>('/products', data).then(r => r.data),
  update: (id: string, data: Partial<Product>) =>
    api.patch<Product>(`/products/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviewApi = {
  getByProduct: (productId: string) =>
    api.get<Review[]>(`/reviews?productId=${productId}`).then(r => r.data),
  create: (data: Partial<Review>) =>
    api.post<Review>('/reviews', data).then(r => r.data),
  update: (id: string, data: Partial<Review>) =>
    api.patch<Review>(`/reviews/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export const cartApi = {
  getByUser: (userId: string) =>
    api.get<Cart[]>(`/carts?userId=${userId}`).then(r => r.data[0]),
  create: (data: Partial<Cart>) => api.post<Cart>('/carts', data).then(r => r.data),
  update: (id: string, data: Partial<Cart>) =>
    api.patch<Cart>(`/carts/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/carts/${id}`),
}

// ─── Wishlist ────────────────────────────────────────────────────────────────
export const wishlistApi = {
  getByUser: (userId: string) =>
    api.get<Wishlist[]>(`/wishlists?userId=${userId}`).then(r => r.data[0]),
  create: (data: Partial<Wishlist>) =>
    api.post<Wishlist>('/wishlists', data).then(r => r.data),
  update: (id: string, data: Partial<Wishlist>) =>
    api.patch<Wishlist>(`/wishlists/${id}`, data).then(r => r.data),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderApi = {
  getAll: () => api.get<Order[]>('/orders').then(r => r.data),
  getByUser: (userId: string) =>
    api.get<Order[]>(`/orders?userId=${userId}`).then(r => r.data),
  getById: (id: string) => api.get<Order>(`/orders/${id}`).then(r => r.data),
  create: (data: Partial<Order>) => api.post<Order>('/orders', data).then(r => r.data),
  update: (id: string, data: Partial<Order>) =>
    api.patch<Order>(`/orders/${id}`, data).then(r => r.data),
}

// ─── Promo Codes ─────────────────────────────────────────────────────────────
export const promoApi = {
  getAll: () => api.get<PromoCode[]>('/promoCodes').then(r => r.data),
  getByCode: (code: string) =>
    api.get<PromoCode[]>(`/promoCodes?code=${code}&isActive=true`).then(r => r.data[0]),
  create: (data: Partial<PromoCode>) =>
    api.post<PromoCode>('/promoCodes', data).then(r => r.data),
  update: (id: string, data: Partial<PromoCode>) =>
    api.patch<PromoCode>(`/promoCodes/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/promoCodes/${id}`),
}

// ─── Banners ─────────────────────────────────────────────────────────────────
export const bannerApi = {
  getAll: () =>
    api.get<Banner[]>('/banners?isActive=true&_sort=order').then(r => r.data),
  create: (data: Partial<Banner>) =>
    api.post<Banner>('/banners', data).then(r => r.data),
  update: (id: string, data: Partial<Banner>) =>
    api.patch<Banner>(`/banners/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/banners/${id}`),
}

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationApi = {
  getByUser: (userId: string) =>
    api.get<Notification[]>(`/notifications?userId=${userId}&_sort=createdAt&_order=desc`).then(r => r.data),
  markRead: (id: string) =>
    api.patch(`/notifications/${id}`, { isRead: true }),
  create: (data: Partial<Notification>) =>
    api.post<Notification>('/notifications', data).then(r => r.data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export const walletApi = {
  getByUser: (userId: string) =>
    api.get<Wallet[]>(`/wallets?userId=${userId}`).then(r => r.data[0]),
  update: (id: string, data: Partial<Wallet>) =>
    api.patch<Wallet>(`/wallets/${id}`, data).then(r => r.data),
  create: (data: Partial<Wallet>) =>
    api.post<Wallet>('/wallets', data).then(r => r.data),
}
