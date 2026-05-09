'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Trash2 } from 'lucide-react'
import { notificationApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const typeIcons: Record<string, string> = {
  order: '📦', promo: '🎟️', system: '⚙️', review: '⭐'
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user ? notificationApi.getByUser(user.id) : Promise.resolve([]),
    enabled: !!user,
  })

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => notificationApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Notification removed') },
  })

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Bell size={24} className="text-orange-500" /> Notifications
            </h1>
            <p className="text-gray-500 text-sm mt-1">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={() => notifications?.filter(n => !n.isRead).forEach(n => markRead.mutate(n.id))}
              className="flex items-center gap-2 text-sm text-orange-500 font-semibold hover:bg-orange-50 px-3 py-1.5 rounded-xl transition-colors">
              <Check size={14} /> Mark All Read
            </button>
          )}
        </div>

        {notifications?.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center card-shadow">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications?.map(notif => (
              <div key={notif.id}
                className={`bg-white rounded-2xl p-4 card-shadow flex gap-4 transition-all
                  ${!notif.isRead ? 'border-l-4 border-orange-500' : ''}`}>
                <div className="text-2xl shrink-0">{typeIcons[notif.type] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                      {!notif.isRead && <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full inline-block" />}
                    </p>
                    <p className="text-xs text-gray-400 shrink-0">{formatDate(notif.createdAt)}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {!notif.isRead && (
                    <button onClick={() => markRead.mutate(notif.id)}
                      className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => remove.mutate(notif.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
