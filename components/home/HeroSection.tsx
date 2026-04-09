'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Store } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getTranslation } from '@/lib/i18n'

type Product = {
  id: string
  name: string
  location: string
}
type VendorStatus = 'none' | 'pending' | 'approved' | 'rejected'

type UserType = {
  id: string
  email?: string
  role: string
  avatar_url?: string
  vendor_status: VendorStatus
}

export default function HeroSection() {
  const t = getTranslation()
  const router = useRouter()

  const slides = [
    { image: '/image/hero1.png', ...t.hero.slide1 },
    { image: '/image/hero2.png', ...t.hero.slide2 },
    { image: '/image/hero5.png', ...t.hero.slide3 },
  ]

  const [current, setCurrent] = useState(0)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 9000)

    return () => clearInterval(interval)
  }, [slides.length])

  // Suggestions (debounced)
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('id, name, location')
        .ilike('name', `%${search}%`)
        .limit(5)

      if (!error && data) {
        setSuggestions(data)
      }

      setLoading(false)
    }

    const delay = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(delay)
  }, [search])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams()

    if (search.trim()) params.append('q', search)
    if (location.trim()) params.append('location', location)

    router.push(`/products?${params.toString()}`)
    setSuggestions([])
  }

  return (
    <main className='relative w-full h-[90vh] overflow-hidden'>
      {/* Slides */}
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
          <h1 className='text-4xl md:text-5xl font-bold'>
            {slides[current].title}{' '}
            <span className='text-[#10b5cb]'>{slides[current].highlight}</span>
          </h1>

          <p className='mt-4 text-lg text-gray-200'>
            {slides[current].description}
          </p>

          {/* 🔍 SEARCH */}
          <div
            ref={wrapperRef}
            className='mt-8 flex flex-col md:flex-row gap-3 relative'
          >
            {/* Product search */}
            <div className='relative flex-1'>
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t.searchPlaceholder}
                className='w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-white text-gray-50 outline-none shadow-md'
              />

              {/* Dropdown */}
              {suggestions.length > 0 && (
                <div className='absolute top-full mt-1 w-full bg-white text-black rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'>
                  {loading && (
                    <div className='px-4 py-2 text-sm text-gray-500'>
                      Loading...
                    </div>
                  )}

                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearch(item.name)
                        setSuggestions([])
                      }}
                      className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                    >
                      <span className='font-medium'>{item.name}</span>
                      <span className='text-sm text-gray-500 ml-2 '>
                        {item.location}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <input
              type='text'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder='📍 Location (e.g. Addis Ababa)'
              className='flex-1 px-4 py-3 rounded-lg bg-white/10 border focus:border-white border-white/20 text-gray-50 outline-none shadow-md'
            />

            {/* Button */}
            <button
              onClick={handleSearch}
              className='bg-white/10 border border-white hover:bg-white/20 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 shadow-md'
            >
              <Search size={18} />
              {t.search}
            </button>
          </div>

          {/* CTA */}
          <div className='flex gap-4 mt-6'>
            <Link
              href='/vendor/onboarding'
              className='flex gap-2 bg-[#10b5cb] hover:bg-[#0e9fb3] px-6 py-3 rounded-md'
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
