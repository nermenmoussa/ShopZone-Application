'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '@/lib/api'

interface ForgotForm {
  email: string
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>()

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    try {
      const user = await userApi.getByEmail(data.email)
      if (!user) {
        toast.error('No account found with this email')
        return
      }
      // هنا في المستقبل هتبعتي reset email حقيقي
      setSent(true)
      toast.success('Reset link sent!')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '88px' }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-8 card-shadow">

        <Link href="/auth/login"
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-6">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {sent ? (
          // ✅ بعد الإرسال
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-black mb-2">Check Your Email!</h1>
            <p className="text-gray-500 text-sm mb-6">
              We sent a password reset link to your email address.
            </p>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity">
              Back to Login <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          // 📝 الفورم
          <>
            <div className="text-center mb-7">
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-2xl font-black mb-2">Forgot Password?</h1>
              <p className="text-gray-500 text-sm">
                Enter your email and we will send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 gradient-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
