'use client'

import { useState } from 'react'
import { signIn } from "next-auth/react"
import { useForm } from 'react-hook-form'

export default function LoginPage() {

  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true)

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl: "/"
    })

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">

        <input
          placeholder="email"
          {...register("email")}
          className="border w-full p-2"
        />

        <input
          placeholder="password"
          type="password"
          {...register("password")}
          className="border w-full p-2"
        />

        <button className="w-full bg-black text-white p-2">
          {loading ? "Loading..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full border p-2"
        >
          Continue with Google
        </button>

      </form>

    </div>
  )
}