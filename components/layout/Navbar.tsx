import { ShoppingCart, User, Menu, Store } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  // temporary state ( this will come from auth)
  const isLoggedIn = false

  return (
    <header className='bg-[#b6f0fa] text-gray-700 shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          {/* Logo */}
          <Link href='/' className='flex-shrink-0 pt-2'>
            <Image src='/logo.png' alt='Logo' width={120} height={40} />
          </Link>

          {/* Search */}
          <div className='flex-1 px-6'>
            <input
              type='text'
              placeholder='Search products...'
              className='w-full rounded-md py-2 px-4 bg-white border focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
            />
          </div>

          {/* Right section */}
          <div className='flex items-center space-x-6'>
            {/* Categories */}
            <div className='relative group'>
              <button className='flex items-center space-x-1 hover:text-gray-500'>
                <Menu size={20} />
                <span className='hidden sm:inline'>Categories</span>
              </button>

              <div className='absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition'>
                <ul>
                  <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    Electronics
                  </li>
                  <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    Clothing
                  </li>
                  <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    Home & Garden
                  </li>
                </ul>
              </div>
            </div>

            {/* Cart */}
            <button className='relative hover:text-gray-500'>
              <ShoppingCart size={22} />
            </button>

            {/* Auth section */}
            {!isLoggedIn ? (
              <div className='flex items-center space-x-4'>
                <Link href='/login' className='text-sm hover:text-gray-500'>
                  Login
                </Link>

                <Link
                  href='/register'
                  className='bg-[#10b5cb] hover:bg-[#0e9fb3] text-white px-4 py-1.5 rounded-md text-sm'
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/vendor/onboarding'
                  className='flex items-center space-x-1 hover:text-gray-500'
                >
                  <Store size={18} />
                  <span className='hidden sm:inline'>Become Vendor</span>
                </Link>

                <button className='hover:text-gray-500'>
                  <User size={22} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
