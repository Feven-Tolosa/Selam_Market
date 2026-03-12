'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Store } from 'lucide-react'

const slides = [
  {
    image: '/image/hero1.png',
    title: 'Discover products from',
    highlight: ' local vendors',
    description:
      'Explore thousands of products from trusted sellers in your area.',
  },
  {
    image: '/image/hero2.png',
    title: 'Shop fresh and quality',
    highlight: ' marketplace deals',
    description:
      'Find amazing discounts and support small businesses near you.',
  },
  {
    image: '/image/hero5.png',
    title: 'Grow your business as a',
    highlight: ' trusted vendor',
    description: 'Join our platform and reach thousands of customers today.',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000) // change every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <main className='relative w-full h-[90vh] overflow-hidden'>
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Dark Overlay */}
      <div className='absolute inset-0 bg-black/50' />

      {/* Content */}
      <section className='relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center'>
        <div className='max-w-2xl text-white'>
          <h1 className='text-4xl md:text-5xl font-bold leading-tight'>
            {slides[current].title}
            <span className='text-[#10b5cb]'>{slides[current].highlight}</span>
          </h1>

          <p className='mt-4 text-lg text-gray-200'>
            {slides[current].description}
          </p>

          {/* Search */}
          <div className='mt-8 flex items-center bg-white rounded-lg overflow-hidden shadow-lg'>
            <input
              type='text'
              placeholder='Search products...'
              className='flex-1 px-4 py-3 outline-none text-gray-700'
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
              className='border border-white text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-white/20'
            >
              <Store size={18} />
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
