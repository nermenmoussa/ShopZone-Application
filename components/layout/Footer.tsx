import Link from 'next/link'
import { Share2, MessageCircle, Camera, Play, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg">S</div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>ShopZone</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Your ultimate shopping destination. Millions of products, unbeatable prices, fast delivery.
            </p>
            <div className="flex gap-3">
              {[Share2, MessageCircle, Camera, Play].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/products', label: 'All Products' },
                { href: '/categories', label: 'Categories' },
                { href: '/deals', label: 'Today\'s Deals' },
                { href: '/sellers', label: 'Become a Seller' },
                { href: '/about', label: 'About Us' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-orange-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/orders', label: 'Track Your Order' },
                { href: '/returns', label: 'Returns & Refunds' },
                { href: '/faq', label: 'FAQ' },
                { href: '/support', label: 'Contact Support' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-orange-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3"><MapPin size={16} className="text-orange-400 shrink-0" /> 123 Commerce St, New York, NY 10001</li>
              <li className="flex items-center gap-3"><Phone size={16} className="text-orange-400 shrink-0" /> +1 (800) SHOPZONE</li>
              <li className="flex items-center gap-3"><Mail size={16} className="text-orange-400 shrink-0" /> support@shopzone.com</li>
            </ul>
            <div className="mt-5">
              <p className="text-sm font-medium text-white mb-2">Newsletter</p>
              <div className="flex">
                <input type="email" placeholder="Enter your email" className="flex-1 px-3 py-2 rounded-l-lg bg-gray-800 text-sm outline-none border border-gray-700 focus:border-orange-400" />
                <button className="px-3 py-2 gradient-primary text-white rounded-r-lg text-sm font-medium">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ShopZone. All rights reserved.</p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png" alt="PayPal" className="h-6 opacity-60" />
          </div>
        </div>
      </div>
    </footer>
  )
}
