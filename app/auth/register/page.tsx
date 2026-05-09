'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Store } from 'lucide-react'
import { userApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'
import { hashPassword } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'

interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'customer' | 'seller'
  agreeTerms: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { role: 'customer' }
  })

  const password = watch('password')
  const role = watch('role')


const onSubmit = async (data: RegisterForm) => {
  setLoading(true)
  try {
    const existing = await userApi.getByEmail(data.email)
    if (existing) {
      toast.error('البريد الإلكتروني مسجل بالفعل')
      return
    }

    const hashedPassword = await hashPassword(data.password)

    const newUser = await userApi.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      isVerified: false,
      isActive: true,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
    })

    setUser(newUser)
    await sendWelcomeEmail(data.name, data.email)
    toast.success(`Welcome to ShopZone, ${data.name}! 🎉`)

    if (data.role === 'seller') router.push('/seller/onboarding')
    else router.push('/')
  } catch {
    toast.error('Registration failed. Please try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '108px', paddingBottom: '40px' }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-8 card-shadow">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-black mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-orange-500 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-gray-100 rounded-2xl">
          <label className={`flex items-center justify-center gap-2 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-semibold
            ${role === 'customer' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-500'}`}>
            <input type="radio" value="customer" {...register('role')} className="hidden" />
            <User size={15} /> Customer
          </label>
          <label className={`flex items-center justify-center gap-2 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-semibold
            ${role === 'seller' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-500'}`}>
            <input type="radio" value="seller" {...register('role')} className="hidden" />
            <Store size={15} /> Seller
          </label>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="John Doe"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" placeholder="+1 234 567 890"
                {...register('phone')}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters"
                {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Repeat password"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: v => v === password || 'Passwords do not match'
                })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-colors" />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" {...register('agreeTerms', { required: 'Please accept terms' })}
              className="mt-0.5 accent-orange-500" />
            <span className="text-xs text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-orange-500 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms.message}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 gradient-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
