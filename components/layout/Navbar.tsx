// components/Navbar.tsx
import { ShoppingCart, User, Menu } from 'lucide-react' // shadcn icons
import Image from 'next/image'

export default function Navbar() {
  return (
    <header className='bg-[#b6f0fa] text-gray-700 shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          {/* Logo */}
          <div className='flex-shrink-0 pt-3'>
            <Image src='/logo.png' alt='Logo' width={120} height={40} />
          </div>
          {/* Language selector */}
          <div className='flex items-center space-x-2'>
            <span className='text-sm'>EN</span>
            <svg
              className='w-4 h-4 text-gray-700'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4 4.708a.75.75 0 01-1.14 0l-4-4.708a.75.75 0 01.02-1.06z'
                clipRule='evenodd'
              />
            </svg>
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
              <button className='flex items-center space-x-1 hover:text-gray-500'>
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
            <button className='relative hover:text-gray-500'>
              <ShoppingCart size={24} />
              <span className='absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                3
              </span>
            </button>

            {/* User icon */}
            <button className='hover:text-gray-500'>
              <User size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
