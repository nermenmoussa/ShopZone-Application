'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      setError(error.message || 'Payment failed')
      setLoading(false)
      return
    }

    // 🔥 IMPORTANT FIX
    if (
      paymentIntent &&
      (paymentIntent.status === 'succeeded' ||
        paymentIntent.status === 'processing')
    ) {
      onSuccess()
    } else {
      setError('Payment not completed')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        disabled={!stripe || loading}
        className="w-full py-3 bg-orange-500 text-white rounded-xl"
      >
        {loading ? 'Processing...' : 'Pay Now 💳'}
      </button>
    </form>
  )
}

export function StripePayment({
  amount,
  onSuccess,
}: {
  amount: number
  onSuccess: () => void
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.clientSecret) {
          console.error('No clientSecret returned')
          return
        }
        setClientSecret(data.clientSecret)
      })
  }, [amount])

  if (!clientSecret) {
    return <p>Loading payment...</p>
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
      }}
    >
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  )
}