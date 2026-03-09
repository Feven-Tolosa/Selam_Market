// components/Navbar.tsx
import { ShoppingCart, User, Menu } from 'lucide-react' // shadcn icons
import Image from 'next/image'

export default function Navbar() {
  return (
    <header className='bg-[#10b5cb] text-white shadow-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <Image
              src='/logo.png' // replace with your logo
              alt='Logo'
              width={120}
              height={40}
            />
          </div>

          {/* Search bar */}
          <div className='flex-1 px-4'>
            <div className='relative w-full'>
              <input
                type='text'
                placeholder='Search products...'
                className='w-full rounded-md py-2 px-4 text-gray-700 bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-white'
              />
            </div>
          </div>

          {/* Right icons */}
          <div className='flex items-center space-x-4'>
            {/* Categories menu */}
            <div className='relative group'>
              <button className='flex items-center space-x-1 hover:text-gray-200'>
                <Menu size={20} />
                <span className='hidden sm:inline'>Categories</span>
              </button>
              <div className='absolute left-0 mt-2 w-48 bg-white text-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
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

            {/* Cart icon */}
            <button className='relative hover:text-gray-200'>
              <ShoppingCart size={24} />
              <span className='absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                3
              </span>
            </button>

            {/* User icon */}
            <button className='hover:text-gray-200'>
              <User size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
