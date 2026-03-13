'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Store } from 'lucide-react'
import { getTranslation } from '@/lib/i18n'

export default function HeroSection() {
  const t = getTranslation()

  const slides = [
    {
      image: '/image/hero1.png',
      ...t.hero.slide1,
    },
    {
      image: '/image/hero2.png',
      ...t.hero.slide2,
    },
    {
      image: '/image/hero5.png',
      ...t.hero.slide3,
    },
  ]

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 9000)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <main className='relative w-full h-[90vh] overflow-hidden'>
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

      <div className='absolute inset-0 bg-black/50' />

      <section className='relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center'>
        <div className='max-w-2xl text-white'>
          <h1 className='text-4xl md:text-5xl font-bold leading-tight'>
            {slides[current].title}{' '}
            <span className='text-[#10b5cb]'>{slides[current].highlight}</span>
          </h1>

          <p className='mt-4 text-lg text-gray-200'>
            {slides[current].description}
          </p>

          <div className='mt-8 flex items-center bg-white rounded-lg overflow-hidden shadow-lg'>
            <input
              type='text'
              placeholder={t.searchPlaceholder}
              className='flex-1 px-4 py-3 outline-none text-gray-700'
            />

            <button className='bg-[#10b5cb] hover:bg-[#0e9fb3] text-white px-6 py-3 flex items-center gap-2'>
              <Search size={18} />
              {t.search}
            </button>
          </div>

          <div className='flex gap-4 mt-6'>
            <Link
              href='/products'
              className='bg-[#10b5cb] hover:bg-[#0e9fb3] text-white px-6 py-3 rounded-md font-medium'
            >
              {t.browseProducts}
            </Link>

            <Link
              href='/vendor/onboarding'
              className='border border-white text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-white/20'
            >
              <Store size={18} />
              {t.becomeVendor}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
