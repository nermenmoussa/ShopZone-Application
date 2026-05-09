
interface OrderItem {
  name: string
  quantity: number
  price: number
}


export const sendOrderConfirmationEmail = async (
  name: string,
  email: string,
  orderId: string,
  total: number,
  items: OrderItem[]
) => {
  const res = await fetch('/api/email/order-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'order',
      name,
      email,
      orderId,
      total,
      items,
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Email failed')
  }

  return res.json()
}


export async function sendWelcomeEmail(
  name: string,
  email: string
) {
  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        name,
        email,
      }),
    })
  } catch (err) {
    console.error('Welcome email error:', err)
  }
}