'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Phone, MapPin, CreditCard, Bell, Lock,
  Edit3, Save, Award, ShoppingBag, Heart, Star
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { userApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

type Tab = 'profile' | 'security' | 'notifications' | 'wallet'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zip: user?.address?.zip || '',
      country: user?.address?.country || '',
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: '88px' }}>
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <Link href="/auth/login" className="px-6 py-3 gradient-primary text-white rounded-2xl font-bold">Sign In</Link>
      </div>
    )
  }

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true)
    try {
      const updated = await userApi.update(user.id, {
        name: data.name,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
        }
      })
      setUser({ ...user, ...updated })
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Orders', value: '12', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Wishlist', value: '8', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Reviews', value: '5', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Points', value: String(user.loyaltyPoints), icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Lock size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'wallet', label: 'Wallet', icon: <CreditCard size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '88px' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 card-shadow mb-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-20 h-20 rounded-2xl border-4 border-orange-100"
              />
              <button className="absolute -bottom-2 -right-2 w-7 h-7 gradient-primary rounded-lg flex items-center justify-center text-white">
                <Edit3 size={12} />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black">{user.name}</h1>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold capitalize">
                      {user.role}
                    </span>
                    {user.isVerified && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400">Member since {formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="text-center p-3 rounded-2xl bg-gray-50">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="font-black text-lg">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Tabs sidebar */}
          <div className="w-48 shrink-0">
            <div className="bg-white rounded-2xl p-2 card-shadow">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${activeTab === tab.id ? 'gradient-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg">Personal Information</h2>
                  {!editing ? (
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-sm text-orange-500 font-semibold hover:bg-orange-50 px-3 py-1.5 rounded-xl transition-colors">
                      <Edit3 size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(false)}
                        className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSubmit(onSubmit)} disabled={loading}
                        className="flex items-center gap-1.5 text-sm gradient-primary text-white font-semibold px-3 py-1.5 rounded-xl hover:opacity-90 transition-opacity">
                        <Save size={14} /> {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { name: 'name', label: 'Full Name', icon: User, type: 'text' },
                    { name: 'email', label: 'Email', icon: Mail, type: 'email', disabled: true },
                    { name: 'phone', label: 'Phone', icon: Phone, type: 'tel' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                        {field.label}
                      </label>
                      <div className="relative">
                        <field.icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={field.type}
                          {...register(field.name as 'name' | 'email' | 'phone')}
                          disabled={!editing || field.disabled}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-orange-500" /> Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'street', label: 'Street', full: true },
                      { name: 'city', label: 'City' },
                      { name: 'state', label: 'State' },
                      { name: 'zip', label: 'ZIP' },
                      { name: 'country', label: 'Country' },
                    ].map(field => (
                      <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">{field.label}</label>
                        <input
                          {...register(field.name as keyof typeof user.address)}
                          disabled={!editing}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h2 className="font-bold text-lg mb-6">Security Settings</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Current Password</label>
                    <input type="password" placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">New Password</label>
                    <input type="password" placeholder="Min 8 characters"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm New Password</label>
                    <input type="password" placeholder="Repeat new password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
                  </div>
                  <button className="px-6 py-2.5 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <h2 className="font-bold text-lg mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Order Updates', desc: 'Get notified when your order status changes', checked: true },
                    { label: 'Promotional Emails', desc: 'Receive deals, discounts and special offers', checked: true },
                    { label: 'New Arrivals', desc: 'Be the first to know about new products', checked: false },
                    { label: 'Price Drops', desc: 'Get alerts when wishlist items go on sale', checked: true },
                    { label: 'Newsletter', desc: 'Weekly newsletter with curated content', checked: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-orange-300 rounded-full peer peer-checked:bg-orange-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                  <p className="text-orange-100 text-sm mb-1">Wallet Balance</p>
                  <p className="text-4xl font-black">$150.00</p>
                  <p className="text-orange-100 text-sm mt-2">🏆 {user.loyaltyPoints} Loyalty Points</p>
                </div>
                <div className="bg-white rounded-2xl p-5 card-shadow">
                  <h3 className="font-bold mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'credit', desc: 'Wallet top-up', amount: 200, date: '2024-01-15' },
                      { type: 'debit', desc: 'Order payment', amount: -50, date: '2024-02-01' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm
                            ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {t.type === 'credit' ? '↓' : '↑'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{t.desc}</p>
                            <p className="text-xs text-gray-400">{t.date}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${t.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {t.type === 'credit' ? '+' : ''}{t.amount < 0 ? '' : ''}${Math.abs(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-3 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                    Add Funds
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
