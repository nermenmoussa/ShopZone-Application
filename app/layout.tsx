import type { Metadata } from 'next'
import './globals.css'

import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/components/providers/QueryProvider'
import AuthProvider from '@/components/providers/AuthProvider'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

export const metadata: Metadata = {
  title: {
    default: 'ShopZone - Your Ultimate Shopping Destination',
    template: '%s | ShopZone',
  },
  description: 'Discover millions of products at the best prices.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <CartDrawer />

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#FF6B35', secondary: '#fff' },
                },
              }}
            />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}