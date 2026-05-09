'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { orderApi } from '@/lib/api'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { OrderStatus } from '@/types'

const statuses: OrderStatus[] = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: orderApi.getAll,
  })

  const updateOrder = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => {
      const statusHistory = [
        ...((orders?.find(o => o.id === id)?.statusHistory) || []),
        { status, timestamp: new Date().toISOString(), note: `Status updated to ${getStatusLabel(status)}` }
      ]
      return orderApi.update(id, { status, statusHistory })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated!')
    },
  })

  const filtered = orders?.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  }) || []

  const totalRevenue = orders?.reduce((s, o) => s + o.total, 0) || 0

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders?.length || 0} total • Revenue: <span className="font-bold text-orange-500">{formatPrice(totalRevenue)}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 card-shadow mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by Order ID..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white">
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Update Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-sm">{order.id}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium">{order.shippingAddress.name}</p>
                    <p className="text-xs text-gray-400">{order.shippingAddress.city}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img key={i} src={item.image} alt={item.name}
                          className="w-8 h-8 rounded-lg border-2 border-white object-cover" />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-sm">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                      {getStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={e => updateOrder.mutate({ id: order.id, status: e.target.value as OrderStatus })}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-orange-400 bg-white">
                      {statuses.map(s => (
                        <option key={s} value={s}>{getStatusLabel(s)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">No orders found</div>
          )}
        </div>
      </div>
    </div>
  )
}
