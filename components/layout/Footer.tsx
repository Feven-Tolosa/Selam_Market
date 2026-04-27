'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, ArrowUp } from 'lucide-react'
import LanguageSwitcher from '../Language/LanguageSwitcher'
import { useState, useEffect } from 'react'
import ReportButton from '../chat/ReportButton'
import { getTranslation } from '@/lib/i18n'

export default function Footer() {
  const t = getTranslation()

  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(window.scrollY)
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer>
      <footer className='bg-[#1a2a3a] text-white border-t border-[#2a3a4a] mt-20 relative z-50'>
        {/* Decorative top border */}
        <div className='h-1 bg-gradient-to-r from-[#10b5cb] via-[#1a2a3a] to-[#10b5cb]' />

        {/* Main footer */}
        <div className='max-w-7xl mx-auto px-6 py-14'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-10'>
            {/* Brand */}
            <div>
              <h2 className='text-lg font-semibold mb-3'>LocalMarket</h2>

              <p className='text-sm text-gray-300 mt-3'>
                Discover products from trusted local vendors and support small
                businesses.
              </p>

              <div className='flex gap-4 mt-4'>
                <Link
                  href='#'
                  className='px-3 py-2 bg-[#10b5cb] rounded text-sm'
                >
                  {t.footer.appStore}
                </Link>
                <Link
                  href='#'
                  className='px-3 py-2 bg-[#10b5cb] rounded text-sm'
                >
                  {t.footer.googlePlay}
                </Link>
              </div>
            </div>

            {/* Marketplace */}
            <div>
              <h3 className='font-semibold mb-3'>{t.footer.marketplace}</h3>

              <ul className='space-y-2 text-sm text-gray-300'>
                <li>
                  <Link href='/products'>{t.footer.browseProducts}</Link>
                </li>
                <li>
                  <Link href='/categories'>{t.footer.categories}</Link>
                </li>
                <li>
                  <Link href='/vendor'>{t.footer.vendors}</Link>
                </li>
              </ul>
            </div>

            {/* Vendors */}
            <div>
              <h3 className='font-semibold mb-3'>{t.footer.forVendors}</h3>

              <ul className='space-y-2 text-sm text-gray-300'>
                <li>
                  <Link href='/vendor/onboarding'>{t.footer.becomeVendor}</Link>
                </li>
                <li>
                  <Link href='/vendor/dashboard'>
                    {t.footer.vendorDashboard}
                  </Link>
                </li>
                <li>
                  <Link href='/vendor/guide'>{t.footer.vendorGuide}</Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className='font-semibold mb-3'>{t.footer.support}</h3>

              <ul className='space-y-2 text-sm text-gray-300'>
                <li>
                  <Link href='/help'>{t.footer.helpCenter}</Link>
                </li>
                <li>
                  <Link href='/contact'>{t.footer.contactUs}</Link>
                </li>
                <li>
                  <Link href='/privacy'>{t.footer.privacyPolicy}</Link>
                </li>
                <li>
                  <ReportButton type='platform' />
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className='border-t border-[#2a3a4a] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='flex gap-3 text-sm'>
              <select className='bg-[#1a2a3a] border border-[#2a3a4a] rounded px-2 py-1 text-white'>
                <option>Addis Ababa</option>
                <option>Jimma</option>
                <option>Hawasa</option>
              </select>

              <LanguageSwitcher />
            </div>

            <div className='flex space-x-4'>
              <Facebook size={20} />
              <Twitter size={20} />
              <Instagram size={20} />
            </div>
          </div>

          <p className='text-center text-gray-400 text-sm mt-2'>
            © {new Date().getFullYear()} LocalMarket. {t.footer.copyright}
          </p>
        </div>
      </footer>

      {/* Scroll to Top Button - Floating button to scroll to navbar */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 z-50 bg-[#10b5cb] hover:bg-[#0e9db0] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group ${
          showScrollTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label='Scroll to top'
      >
        <ArrowUp
          size={24}
          style={{
            animation: 'bounce-up 1s ease-in-out infinite',
          }}
        />
      </button>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce-up {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </footer>
  )
}
