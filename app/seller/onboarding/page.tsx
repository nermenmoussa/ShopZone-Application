'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Store, ArrowRight, CheckCircle } from 'lucide-react'
import { sellerApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

interface OnboardingForm {
  storeName: string
  storeDescription: string
  logo?: string
}

export default function SellerOnboardingPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingForm>()

  // =========================
  // SAFE CHECK (IMPORTANT)
  // =========================
  if (!user) {
    router.push('/login')
    return null
  }

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = async (data: OnboardingForm) => {
    setLoading(true)

    try {
      const payload = {
        userId: user.id,
        storeName: data.storeName.trim(),
        storeDescription: data.storeDescription.trim(),
        logo:
          data.logo?.trim() ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${data.storeName}`,
        totalEarnings: 0,
        pendingPayout: 0,
        rating: 0,
        totalSales: 0,
        isApproved: false,
        createdAt: new Date().toISOString(),
      }

      const res = await sellerApi.create(payload)

      if (!res) throw new Error('Failed to create store')

      toast.success('Store created successfully 🎉')

      setStep(2)
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // SUCCESS SCREEN
  // =========================
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-md max-w-md w-full">

          <CheckCircle size={50} className="mx-auto text-green-500 mb-4" />

          <h1 className="text-2xl font-black mb-2">
            Store Created 🎉
          </h1>

          <p className="text-gray-500 mb-6">
            Your store is under review. You’ll be notified soon.
          </p>

          <button
            onClick={() => router.push('/seller/dashboard')}
            className="w-full py-3 bg-orange-500 text-white rounded-xl mb-3"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 border rounded-xl"
          >
            Back Home
          </button>
        </div>
      </div>
    )
  }

  // =========================
  // FORM UI
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 pt-24">

      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow">

        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-orange-500 text-white flex items-center justify-center rounded-xl mx-auto mb-3">
            <Store />
          </div>
          <h1 className="text-xl font-black">Create Your Store</h1>
          <p className="text-gray-500 text-sm">
            Start selling in minutes
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input
            placeholder="Store Name"
            {...register('storeName', {
              required: 'Store name is required',
              minLength: 3,
            })}
            className="w-full border p-3 rounded-xl"
          />
          {errors.storeName && (
            <p className="text-red-500 text-xs">
              Store name is required
            </p>
          )}

          <textarea
            placeholder="Store Description"
            {...register('storeDescription', {
              required: true,
              minLength: 10,
            })}
            className="w-full border p-3 rounded-xl"
          />

          <input
            placeholder="Logo URL (optional)"
            {...register('logo')}
            className="w-full border p-3 rounded-xl"
          />

          {/* INFO */}
          <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-600">
            Your store will be reviewed before approval.
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold"
          >
            {loading ? 'Creating...' : 'Create Store'}
          </button>

        </form>
      </div>
    </div>
  )
}