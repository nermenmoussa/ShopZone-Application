'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { bannerApi } from '@/lib/api'
import toast from 'react-hot-toast'
import type { Banner } from '@/types'

export default function AdminBannersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState({
    title: '', subtitle: '', image: '', link: '', buttonText: '', order: '1'
  })
  const queryClient = useQueryClient()

  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: bannerApi.getAll,
  })

  const create = useMutation({
    mutationFn: (data: Partial<Banner>) => bannerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      setShowForm(false)
      toast.success('Banner created!')
    },
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Banner> }) =>
      bannerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      setShowForm(false)
      setEditing(null)
      toast.success('Banner updated!')
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => bannerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Banner deleted!')
    },
  })

  const toggle = useMutation({
    mutationFn: (banner: Banner) =>
      bannerApi.update(banner.id, { isActive: !banner.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Banner updated!')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...form, order: Number(form.order), isActive: true }
    if (editing) update.mutate({ id: editing.id, data })
    else create.mutate(data)
  }

  const openEdit = (banner: Banner) => {
    setEditing(banner)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      link: banner.link,
      buttonText: banner.buttonText,
      order: String(banner.order),
    })
    setShowForm(true)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black">Banners</h1>
          <p className="text-gray-500 text-sm mt-1">{banners?.length || 0} banners</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ title: '', subtitle: '', image: '', link: '', buttonText: '', order: '1' })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6">
            <h2 className="font-black text-lg mb-5">
              {editing ? 'Edit Banner' : 'Add Banner'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Title</label>
                <input required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Summer Sale - Up to 50% Off"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Subtitle</label>
                <input value={form.subtitle}
                  onChange={e => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Shop the biggest deals of the season"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Image URL</label>
                <input required value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              {/* Preview */}
              {form.image && (
                <div className="relative h-32 rounded-xl overflow-hidden">
                  <img src={form.image} alt="preview"
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <p className="text-white font-bold text-sm">{form.title}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Link</label>
                  <input value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    placeholder="/products"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Button Text</label>
                  <input value={form.buttonText}
                    onChange={e => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="Shop Now"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Order</label>
                <input type="number" value={form.order}
                  onChange={e => setForm({ ...form, order: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowForm(false); setEditing(null) }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banners List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {banners?.map(banner => (
            <div key={banner.id} className={`bg-white rounded-2xl overflow-hidden card-shadow flex gap-4 p-4
              ${!banner.isActive ? 'opacity-60' : ''}`}>
              <div className="relative w-48 h-28 rounded-xl overflow-hidden shrink-0">
                <img src={banner.image} alt={banner.title}
                  className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{banner.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{banner.subtitle}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Link: {banner.link}</span>
                      <span>Order: {banner.order}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle.mutate(banner)}
                      className="text-gray-400 hover:text-orange-500 transition-colors">
                      {banner.isActive
                        ? <ToggleRight size={28} className="text-orange-500" />
                        : <ToggleLeft size={28} />}
                    </button>
                    <button onClick={() => openEdit(banner)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => { if (confirm('Delete?')) remove.mutate(banner.id) }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full
                  ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
