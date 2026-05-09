import { Suspense } from 'react'
import ProductsPageClient from './ProductsClient'

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '88px' }}>
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsPageClient />
    </Suspense>
  )
}
