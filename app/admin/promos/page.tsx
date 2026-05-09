'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { promoApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PromoCode } from '@/types'

export default function AdminPromosPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '0', maxUses: '100' })
  const queryClient = useQueryClient()

  const { data: promos } = useQuery({ queryKey: ['admin-promos'], queryFn: promoApi.getAll })

  const create = useMutation({
    mutationFn: (data: Partial<PromoCode>) => promoApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-promos'] }); setShowForm(false); toast.success('Promo code created!') },
  })

  const toggle = useMutation({
    mutationFn: (promo: PromoCode) => promoApi.update(promo.id, { isActive: !promo.isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-promos'] }); toast.success('Promo updated!') },
  })

  const remove = useMutation({
    mutationFn: (id: string) => promoApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-promos'] }); toast.success('Promo deleted!') },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    create.mutate({
      code: form.code.toUpperCase(),
      type: form.type as PromoCode['type'],
      value: Number(form.value),
      minOrder: Number(form.minOrder),
      maxUses: Number(form.maxUses),
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black">Promo Codes</h1>
          <p className="text-gray-500 text-sm mt-1">{promos?.length || 0} codes</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90">
          <Plus size={16} /> Create Code
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <h2 className="font-black text-lg mb-5">Create Promo Code</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Code</label>
                <input required placeholder="e.g. SAVE20" value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Value</label>
                  <input type="number" required value={form.value}
                    onChange={e => setForm({...form, value: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Min. Order ($)</label>
                  <input type="number" value={form.minOrder}
                    onChange={e => setForm({...form, minOrder: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Max Uses</label>
                  <input type="number" value={form.maxUses}
                    onChange={e => setForm({...form, maxUses: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:opacity-90">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos?.map(promo => (
          <div key={promo.id} className={`bg-white rounded-2xl p-5 card-shadow border-2 ${promo.isActive ? 'border-orange-100' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-orange-500" />
                <span className="font-black text-lg font-mono">{promo.code}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggle.mutate(promo)}
                  className="text-gray-400 hover:text-orange-500 transition-colors">
                  {promo.isActive ? <ToggleRight size={24} className="text-orange-500" /> : <ToggleLeft size={24} />}
                </button>
                <button onClick={() => { if(confirm('Delete?')) remove.mutate(promo.id) }}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-semibold text-orange-500">
                  {promo.type === 'percentage' ? `${promo.value}% off`
                    : promo.type === 'fixed' ? `$${promo.value} off`
                    : 'Free Shipping'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min. Order</span>
                <span className="font-semibold">${promo.minOrder}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Used</span>
                <span className="font-semibold">{promo.usedCount} / {promo.maxUses}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Usage</span><span>{Math.round((promo.usedCount / promo.maxUses) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full"
                    style={{ width: `${Math.min(100, (promo.usedCount / promo.maxUses) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
