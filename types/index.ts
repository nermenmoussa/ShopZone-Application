// User types
export type UserRole = 'customer' | 'seller' | 'admin'

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  password?: string
  role: UserRole
  avatar?: string
  address?: Address
  isVerified: boolean
  isActive: boolean
  loyaltyPoints: number
  createdAt: string
}

export interface Seller {
  id: string
  userId: string
  storeName: string
  storeDescription: string
  logo?: string
  banner?: string
  totalEarnings: number
  pendingPayout: number
  rating: number
  totalSales: number
  isApproved: boolean
  createdAt: string
}

// Product types
export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  image: string
  parentId: string | null
  productCount: number
}

export interface ProductSpecifications {
  [key: string]: string
}

export interface Product {
  id: string
  sellerId: string
  categoryId: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number
  discount: number
  images: string[]
  stock: number
  sku: string
  brand: string
  tags: string[]
  specifications: ProductSpecifications
  rating: number
  reviewCount: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

// Review types
export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  title: string
  comment: string
  helpful: number
  verified: boolean
  createdAt: string
  user?: User
}

// Cart types
export interface CartItem {
  productId: string
  quantity: number
  price: number
  product?: Product
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  updatedAt: string
}

// Wishlist
export interface Wishlist {
  id: string
  userId: string
  productIds: string[]
  updatedAt: string
}

// Order types
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentMethod = 'credit_card' | 'paypal' | 'cash_on_delivery' | 'wallet'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  image: string
}

export interface OrderStatusHistory {
  status: OrderStatus
  timestamp: string
  note: string
}

export interface Order {
  id: string
  userId: string
  sellerId: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  promoCode: string | null
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  shippingAddress: Address & { name: string }
  status: OrderStatus
  trackingNumber?: string
  statusHistory: OrderStatusHistory[]
  createdAt: string
}

// Promo code
export type PromoType = 'percentage' | 'fixed' | 'shipping'

export interface PromoCode {
  id: string
  code: string
  type: PromoType
  value: number
  minOrder: number
  maxUses: number
  usedCount: number
  isActive: boolean
  expiresAt: string
}

// Banner
export interface Banner {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  buttonText: string
  isActive: boolean
  order: number
}

// Notification
export type NotificationType = 'order' | 'promo' | 'system' | 'review'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

// Wallet
export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  transactions: WalletTransaction[]
}

// Saved payment
export interface SavedPayment {
  id: string
  userId: string
  type: 'credit_card' | 'paypal'
  last4?: string
  brand?: string
  expMonth?: number
  expYear?: number
  isDefault: boolean
}

// UI types
export interface FilterOptions {
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  brand?: string
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
