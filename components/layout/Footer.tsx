import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className='bg-white border-t mt-20'>
      {/* Main footer */}
      <div className='max-w-7xl mx-auto px-6 py-14'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-10'>
          {/* Brand */}
          <div>
            <h2 className='text-lg font-semibold text-[#10b5cb]'>
              LocalMarket
            </h2>

            <p className='text-sm text-gray-600 mt-3'>
              Discover products from trusted local vendors and support small
              businesses.
            </p>

            {/* App download */}
            {/* <div className='mt-4 space-y-2'>
              <Image src='/app.png' alt='App Store' width={140} height={40} />

              <Image
                src='/play.png'
                alt='Google Play'
                width={140}
                height={40}
              />
            </div> */}
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
        <div className='border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4'>
          {/* Country / language selector */}
          <div className='flex gap-3 text-sm'>
            <select className='border rounded px-2 py-1'>
              <option>English</option>
              <option>Amharic</option>
              <option>Oromiffa</option>
            </select>

            <select className='border rounded px-2 py-1'>
              <option>Ethiopia</option>
              <option>USA</option>
              <option>UK</option>
            </select>
          </div>

          {/* Payment icons */}

          {/* <div className='flex items-center gap-4'>
            <Image src='/visa.png' alt='Visa' width={40} height={25} />
            <Image
              src='/mastercard.png'
              alt='Mastercard'
              width={40}
              height={25}
            />
            <Image src='/paypal.png' alt='PayPal' width={40} height={25} />
          </div> */}

          {/* Social icons */}
          <div className='flex space-x-4'>
            <a className='text-gray-500 hover:text-[#10b5cb]'>
              <Facebook size={20} />
            </a>

            <a className='text-gray-500 hover:text-[#10b5cb]'>
              <Twitter size={20} />
            </a>

            <a className='text-gray-500 hover:text-[#10b5cb]'>
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <p className='text-center text-gray-500 text-sm mt-6'>
          © {new Date().getFullYear()} LocalMarket. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
