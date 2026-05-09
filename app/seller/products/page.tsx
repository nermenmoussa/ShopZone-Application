'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react'
import { productApi, categoryApi, sellerApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function SellerProductsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    brand: '',
    stock: '',
    sku: '',
    images: '',
    isActive: true,
    isFeatured: false,
  })

  // ================= SELLER =================
  const { data: seller } = useQuery({
    queryKey: ['seller', user?.id],
    queryFn: () => (user ? sellerApi.getByUserId(user.id) : null),
    enabled: !!user,
  })

  // ================= PRODUCTS =================
  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products', seller?.id],
    queryFn: () =>
      seller ? productApi.getBySeller(seller.id) : Promise.resolve([]),
    enabled: !!seller,
  })

  // ================= CATEGORIES =================
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  })

  // ================= CREATE =================
  const create = useMutation({
    mutationFn: (data: Partial<Product>) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products', seller?.id] })
      setShowForm(false)
      resetForm()
      toast.success('Product created!')
    },
  })

  // ================= UPDATE =================
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products', seller?.id] })
      setShowForm(false)
      setEditing(null)
      resetForm()
      toast.success('Product updated!')
    },
  })

  // ================= DELETE =================
  const remove = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products', seller?.id] })
      toast.success('Product deleted!')
    },
  })

  // ================= TOGGLE ACTIVE =================
  const toggleActive = useMutation({
    mutationFn: (product: Product) =>
      productApi.update(product.id, { isActive: !product.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products', seller?.id] })
      toast.success('Updated!')
    },
  })

  // ================= RESET FORM =================
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      brand: '',
      stock: '',
      sku: '',
      images: '',
      isActive: true,
      isFeatured: false,
    })
  }

  // ================= SUBMIT =================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!seller?.id) {
      toast.error('Seller not ready yet')
      return
    }

    const price = Number(form.price)
    const originalPrice = Number(form.originalPrice)

    const discount =
      originalPrice > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0

    const data: Partial<Product> = {
      ...form,
      price,
      originalPrice,
      stock: Number(form.stock),
      images: form.images
        ? form.images.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      discount,
      rating: editing?.rating || 0,
      reviewCount: editing?.reviewCount || 0,
      tags: [],
      specifications: {},
      sellerId: seller.id,
      slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: editing?.createdAt || new Date().toISOString(),
    }

    if (editing) update.mutate({ id: editing.id, data })
    else create.mutate(data)
  }

  // ================= EDIT =================
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      originalPrice: String(p.originalPrice),
      categoryId: p.categoryId,
      brand: p.brand,
      stock: String(p.stock),
      sku: p.sku,
      images: p.images?.join(', ') || '',
      isActive: p.isActive,
      isFeatured: p.isFeatured,
    })
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">My Products</h1>
            <p className="text-gray-500 text-sm mt-1">
              {products?.length || 0} products
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(null)
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* EMPTY */}
        {!isLoading && products?.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-bold text-xl">No products yet</h3>
            <p className="text-gray-500 mb-6">Start selling now</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold"
            >
              Add Product
            </button>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products?.map(product => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden">
              <img
                src={product.images?.[0] || '/placeholder.png'}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">
                <p className="font-semibold text-sm">{product.name}</p>
                <p className="text-orange-500 font-bold">
                  {formatPrice(product.price)}
                </p>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(product)}>
                    <Edit size={14} />
                  </button>

                  <button onClick={() => toggleActive.mutate(product)}>
                    {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  <button onClick={() => remove.mutate(product.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FORM MODAL (same UI but safe logic) */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-3xl w-full max-w-2xl"
            >
              <h2 className="font-bold text-lg mb-4">
                {editing ? 'Edit' : 'Create'} Product
              </h2>

              <input
                className="input"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-orange-500 text-white rounded-xl"
              >
                Save
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}