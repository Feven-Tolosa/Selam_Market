import Link from 'next/link'
import { Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className='bg-white border-t mt-20'>
      <div className='max-w-7xl mx-auto px-6 py-12'>
        {/* Footer grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-10'>
          {/* Brand */}
          <div>
            <h2 className='text-lg font-semibold text-[#10b5cb]'>
              LocalMarket
            </h2>

            <p className='text-sm text-gray-600 mt-3'>
              Discover products from trusted local vendors and support small
              businesses around you.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className='font-semibold text-gray-800 mb-3'>Marketplace</h3>

            <ul className='space-y-2 text-sm text-gray-600'>
              <li>
                <Link href='/products' className='hover:text-[#10b5cb]'>
                  Browse Products
                </Link>
              </li>

              <li>
                <Link href='/categories' className='hover:text-[#10b5cb]'>
                  Categories
                </Link>
              </li>

              <li>
                <Link href='/vendors' className='hover:text-[#10b5cb]'>
                  Vendors
                </Link>
              </li>
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <h3 className='font-semibold text-gray-800 mb-3'>For Vendors</h3>

            <ul className='space-y-2 text-sm text-gray-600'>
              <li>
                <Link
                  href='/vendor/onboarding'
                  className='hover:text-[#10b5cb]'
                >
                  Become a Vendor
                </Link>
              </li>

              <li>
                <Link href='/vendor/dashboard' className='hover:text-[#10b5cb]'>
                  Vendor Dashboard
                </Link>
              </li>

              <li>
                <Link href='/vendor/guide' className='hover:text-[#10b5cb]'>
                  Vendor Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='font-semibold text-gray-800 mb-3'>Support</h3>

            <ul className='space-y-2 text-sm text-gray-600'>
              <li>
                <Link href='/help' className='hover:text-[#10b5cb]'>
                  Help Center
                </Link>
              </li>

              <li>
                <Link href='/contact' className='hover:text-[#10b5cb]'>
                  Contact Us
                </Link>
              </li>

              <li>
                <Link href='/privacy' className='hover:text-[#10b5cb]'>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className='border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-sm text-gray-500'>
            © {new Date().getFullYear()} LocalMarket. All rights reserved.
          </p>

          {/* Social links */}
          <div className='flex space-x-4 mt-4 md:mt-0'>
            <a href='#' className='text-gray-500 hover:text-[#10b5cb]'>
              <Facebook size={20} />
            </a>

            <a href='#' className='text-gray-500 hover:text-[#10b5cb]'>
              <Twitter size={20} />
            </a>

            <a href='#' className='text-gray-500 hover:text-[#10b5cb]'>
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
