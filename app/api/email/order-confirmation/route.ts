import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface EmailRequestBody {
  type: string
  name: string
  email: string
  orderId: string
  total: number
  items: OrderItem[]
}

export async function POST(request: Request) {
  try {
    const body: EmailRequestBody = await request.json()
    const { type, name, email, orderId, total, items } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (type !== 'order') {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      )
    }

    const itemsHtml = items
      .map((item: OrderItem) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; text-align:center;">${item.quantity}</td>
          <td style="padding: 12px; text-align:right; color:#FF6B35;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `)
      .join('')

    await resend.emails.send({
      from: 'ShopZone <onboarding@resend.dev>',
      to: email,
      subject: `✅ Order Confirmed - ${orderId}`,
      html: `
        <div style="font-family: Arial; max-width:600px; margin:auto; padding: 40px 20px;">
          <h2 style="color: #1a1a2e;">Hi ${name} 👋</h2>
          <p style="color: #4b5563;">Your order <b>${orderId}</b> is confirmed.</p>

          <table style="width:100%; border-collapse:collapse; margin: 24px 0;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align:left;">Product</th>
                <th style="padding: 12px; text-align:center;">Qty</th>
                <th style="padding: 12px; text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <h3 style="color: #FF6B35;">Total: $${total.toFixed(2)}</h3>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}"
             style="display:inline-block; background:#FF6B35; color:white; padding: 12px 24px;
                    border-radius: 12px; text-decoration:none; font-weight:700; margin-top: 16px;">
            Track Your Order 📦
          </a>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}