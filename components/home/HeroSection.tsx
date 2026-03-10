import Link from 'next/link'
import { Search, Store } from 'lucide-react'

export default function HeroSection() {
  return (
    <>
      <main className='bg-white'>
        {/* HERO */}
        <section className='max-w-7xl mx-auto px-6 py-20'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Left content */}
            <div>
              <h1 className='text-4xl md:text-5xl font-bold text-gray-800 leading-tight'>
                Discover products from
                <span className='text-[#10b5cb]'> local vendors</span>
              </h1>

              <p className='text-gray-500 mt-4 text-lg'>
                Explore thousands of products from trusted sellers in your area.
                Support local businesses and find what you need quickly.
              </p>

              {/* Search */}
              <div className='mt-8 flex items-center border rounded-lg overflow-hidden shadow-sm'>
                <input
                  type='text'
                  placeholder='Search products...'
                  className='flex-1 px-4 py-3 outline-none'
                />

                <button className='bg-[#10b5cb] hover:bg-[#0e9fb3] text-white px-6 py-3 flex items-center gap-2'>
                  <Search size={18} />
                  Search
                </button>
              </div>

              {/* Buttons */}
              <div className='flex gap-4 mt-6'>
                <Link
                  href='/products'
                  className='bg-[#10b5cb] hover:bg-[#0e9fb3] text-white px-6 py-3 rounded-md font-medium'
                >
                  Browse Products
                </Link>

                <Link
                  href='/vendor/onboarding'
                  className='border border-[#10b5cb] text-[#10b5cb] px-6 py-3 rounded-md flex items-center gap-2 hover:bg-[#10b5cb]/10'
                >
                  <Store size={18} />
                  Become a Vendor
                </Link>
              </div>
            </div>

            {/* Right illustration */}
            <div className='hidden md:flex justify-center'>
              <div className='bg-[#10b5cb]/10 rounded-2xl p-10'>
                <img
                  src='/hero-marketplace.png'
                  alt='Marketplace'
                  className='w-[420px]'
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
