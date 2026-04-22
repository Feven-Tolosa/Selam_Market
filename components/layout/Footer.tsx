'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, ArrowUp } from 'lucide-react'
import LanguageSwitcher from '../Language/LanguageSwitcher'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Hide/show footer on scroll (optional feature)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(window.scrollY)
      
      // Show scroll to top button when scrolled down
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <footer>
      <footer className={`bg-[#1a2a3a] text-white border-t border-[#2a3a4a] mt-20 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } relative z-50`}>
        {/* Decorative top border gradient */}
        <div className="h-1 bg-gradient-to-r from-[#10b5cb] via-[#1a2a3a] to-[#10b5cb]" style={{
          animation: 'gradient-x 3s ease infinite',
          backgroundSize: '200% 100%'
        }}></div>
        
        {/* Main footer */}
        <div className='max-w-7xl mx-auto px-6 py-14'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-10'>
            {/* Brand */}
            <div className='transform hover:scale-105 transition-transform duration-300'>
              <h2 className='text-lg font-semibold text-white mb-3 relative inline-block group'>
                LocalMarket
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-[#10b5cb] group-hover:w-full transition-all duration-300'></span>
              </h2>

              <p className='text-sm text-gray-300 mt-3 leading-relaxed'>
                Discover products from trusted local vendors and support small
                businesses.
              </p>

              {/* App downloads with animations */}
              <div className='flex gap-4 mt-4'>
                <Link
                  href='https://www.apple.com/app-store/'
                  className='px-3 py-2 bg-[#10b5cb] text-white rounded text-sm hover:bg-[#0e9db0] transition-all duration-300 hover:shadow-lg hover:-translate-y-1'
                >
                  App Store
                </Link>
                <Link
                  href='https://play.google.com/store/games?hl=en'
                  className='px-3 py-2 bg-[#10b5cb] text-white rounded text-sm hover:bg-[#0e9db0] transition-all duration-300 hover:shadow-lg hover:-translate-y-1'
                >
                  Google Play
                </Link>
              </div>
            </div>

            {/* Marketplace */}
            <div>
              <h3 className='font-semibold text-white mb-3 relative inline-block group'>
                Marketplace
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10b5cb] group-hover:w-full transition-all duration-300'></span>
              </h3>

              <ul className='space-y-2 text-sm text-gray-300'>
                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/products' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Browse Products
                  </Link>
                </li>

                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/categories' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Categories
                  </Link>
                </li>

                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/vendor' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Vendors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Vendors */}
            <div>
              <h3 className='font-semibold text-white mb-3 relative inline-block group'>
                For Vendors
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10b5cb] group-hover:w-full transition-all duration-300'></span>
              </h3>

              <ul className='space-y-2 text-sm text-gray-300'>
                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link
                    href='/vendor/onboarding'
                    className='hover:text-[#10b5cb] inline-block transition-colors'
                  >
                    Become a Vendor
                  </Link>
                </li>

                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/vendor/dashboard' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Vendor Dashboard
                  </Link>
                </li>

                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/vendor/guide' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Vendor Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className='font-semibold text-white mb-3 relative inline-block group'>
                Support
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10b5cb] group-hover:w-full transition-all duration-300'></span>
              </h3>

              <ul className='space-y-2 text-sm text-gray-300'>
                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/help' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Help Center
                  </Link>
                </li>

                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/contact' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Contact Us
                  </Link>
                </li>

                <li className='transform hover:translate-x-2 transition-all duration-200'>
                  <Link href='/privacy' className='hover:text-[#10b5cb] inline-block transition-colors'>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className='border-t border-[#2a3a4a] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4'>
            {/* Country / language selector */}
            <div className='flex gap-3 text-sm'>
              <select className='bg-[#1a2a3a] border border-[#2a3a4a] rounded px-2 py-1 transition-all duration-300 hover:scale-105 cursor-pointer hover:border-[#10b5cb] focus:outline-none focus:ring-2 focus:ring-[#10b5cb]/50 text-white'>
                <option>Addis Ababa</option>
                <option>Jimma</option>
                <option>Hawasa</option>
                <option>Adama</option>
                <option>Bahir Dar</option>
                <option>Gondar</option>
                <option>Dire Dawa</option>
                <option>Harar</option>
              </select>
              <div className="transform hover:scale-105 transition-all duration-300">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Social icons */}
            <div className='flex space-x-4'>
              <Link
                href='https://facebook.com'
                className='text-gray-400 hover:text-[#10b5cb] transition-all duration-300 hover:scale-125 inline-block'
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
              </Link>

              <Link
                href='https://twitter.com'
                className='text-gray-400 hover:text-[#10b5cb] transition-all duration-300 hover:scale-125 inline-block'
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={20} />
              </Link>

              <Link
                href='https://instagram.com'
                className='text-gray-400 hover:text-[#10b5cb] transition-all duration-300 hover:scale-125 inline-block'
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          <p className='text-center text-gray-400 text-sm mt-2' style={{
            animation: 'pulse-slow 3s ease-in-out infinite'
          }}>
            © {new Date().getFullYear()} LocalMarket. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Scroll to Top Button - Floating button to scroll to navbar */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 bg-[#10b5cb] hover:bg-[#0e9db0] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} style={{
          animation: 'bounce-up 1s ease-in-out infinite'
        }} />
        
      </button>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes bounce-up {
          0%, 100% {
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