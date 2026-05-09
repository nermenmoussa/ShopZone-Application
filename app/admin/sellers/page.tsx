'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Store } from 'lucide-react'
import { sellerApi, userApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Seller } from '@/types'

export default function AdminSellersPage() {
  const queryClient = useQueryClient()

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: sellerApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userApi.getAll,
  })

  // ========================
  // TOGGLE APPROVAL (FIXED)
  // ========================
  const toggleApprove = useMutation({
    mutationFn: async (seller: Seller) => {
      return sellerApi.update(seller.id, {
        isApproved: !seller.isApproved,
      })
    },

    onMutate: async (seller) => {
      await queryClient.cancelQueries({ queryKey: ['admin-sellers'] })

      const prev = queryClient.getQueryData<Seller[]>(['admin-sellers'])

      queryClient.setQueryData(['admin-sellers'], (old: Seller[] = []) =>
        old.map(s =>
          s.id === seller.id
            ? { ...s, isApproved: !s.isApproved }
            : s
        )
      )

      return { prev }
    },

    onError: (_err, _seller, context) => {
      queryClient.setQueryData(['admin-sellers'], context?.prev)
      toast.error('Something went wrong')
    },

    onSuccess: (_, seller) => {
      toast.success(
        seller.isApproved ? 'Seller suspended' : 'Seller approved'
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-sellers'],
        exact: true,
      })
    },
  })

  const getUser = (userId: string) =>
    users.find(u => u.id === userId)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-1">Sellers</h1>
      <p className="text-gray-500 mb-6">
        {sellers.length} sellers
      </p>

      {/* TABLE */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">

          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="p-3 text-left">Seller</th>
              <th className="p-3 text-left">Store</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Sales</th>
              <th className="p-3">Earnings</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="p-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              sellers.map(seller => {
                const user = getUser(seller.userId)

                return (
                  <tr key={seller.id} className="border-t">

                    {/* USER */}
                    <td className="p-3 flex items-center gap-2">
                      <img
                        src={
                          user?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.storeName}`
                        }
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold">
                          {user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </td>

                    {/* STORE */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Store size={14} />
                        <div>
                          <p className="font-semibold text-sm">
                            {seller.storeName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {seller.storeDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* RATING */}
                    <td className="text-center text-sm">
                      ⭐ {seller.rating}
                    </td>

                    {/* SALES */}
                    <td className="text-center text-sm">
                      {seller.totalSales}
                    </td>

                    {/* EARNINGS */}
                    <td className="text-center">
                      <p className="text-green-600 font-bold text-sm">
                        {formatPrice(seller.totalEarnings)}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          seller.isApproved
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {seller.isApproved
                          ? 'Approved'
                          : 'Pending'}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="text-center">
                      <button
                        onClick={() =>
                          toggleApprove.mutate(seller)
                        }
                        className={`text-xs px-3 py-1 rounded-lg ${
                          seller.isApproved
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {seller.isApproved ? (
                          <>
                            <XCircle size={12} /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} /> Approve
                          </>
                        )}
                      </button>
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {!isLoading && sellers.length === 0 && (
          <p className="text-center py-6 text-gray-500">
            No sellers yet
          </p>
        )}
      </div>
    </div>
  )
}