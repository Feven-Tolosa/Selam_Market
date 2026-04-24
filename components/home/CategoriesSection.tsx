'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Smartphone, Shirt, Sofa, Laptop, Watch, Home, Camera, Book, Car, Coffee, Dumbbell, Gamepad, Gem, Music, Package } from 'lucide-react'

type Category = {
  id: string
  name: string
  slug?: string | null
  image_url?: string | null
}

const iconMap: Record<string, React.ElementType> = {
  electronics: Smartphone,
  clothing: Shirt,
  furniture: Sofa,
  computers: Laptop,
  accessories: Watch,
  home: Home,
  cameras: Camera,
  books: Book,
  automotive: Car,
  food: Coffee,
  fitness: Dumbbell,
  gaming: Gamepad,
  jewelry: Gem,
  music: Music,
  other: Package,
}

// Fallback categories in case database is empty
const fallbackCategories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Clothing', slug: 'clothing' },
  { id: '3', name: 'Furniture', slug: 'furniture' },
  { id: '4', name: 'Computers', slug: 'computers' },
  { id: '5', name: 'Accessories', slug: 'accessories' },
  { id: '6', name: 'Home & Garden', slug: 'home' },
]

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, image_url')

        if (error) {
          console.error('Supabase error:', error.message)
          setCategories(fallbackCategories)
        } else if (data && data.length > 0) {
          setCategories(data)
        } else {
          setCategories(fallbackCategories)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories(fallbackCategories)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Auto-move active category every 2 seconds (like automatic hover)
  useEffect(() => {
    if (categories.length === 0) return
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length)
    }, 2000) // Change every 2 seconds

    return () => clearInterval(interval)
  }, [categories.length])

  if (loading) {
    return (
      <section className='py-16 bg-gradient-to-br from-gray-50 to-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className="text-center mb-12">
            
            <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-3'>
              Browse{' '}
              <span className='text-[#10b5cb]'>
                Categories
              </span>
            </h2>
          </div>
          <div className="flex justify-center items-center h-40">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[#10b5cb]/20 border-t-[#10b5cb] rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading categories...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <span className="bg-[#10b5cb]/10 className='text-3xl font-bold' style={{ color: '#10b5cb' }}">
              Shop by Category
            </span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-3'>
            Browse{' '}
            <span className='text-[#10b5cb]'>
              Categories
            </span>
          </h2>
          <p className='text-gray-500 max-w-2xl mx-auto'>
            Explore our wide range of products across different categories
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available.</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6'>
            {categories.map((cat, index) => {
              const key = cat.slug?.toLowerCase() || cat.name.toLowerCase().replace(/\s+/g, '')
              const Icon = iconMap[key] || Package
              const isActive = activeIndex === index

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="group block"
                >
                  <div className={`
                    relative bg-white rounded-2xl p-6 border border-gray-100
                    transition-all duration-500 ease-in-out
                    cursor-pointer
                    ${isActive 
                      ? 'shadow-2xl -translate-y-3 border-[#10b5cb] border-2' 
                      : 'shadow-md translate-y-0 border-gray-100'
                    }
                  `}>
                    {/* Animated Background Glow */}
                    <div className={`
                      absolute inset-0 bg-[#10b5cb]/5 rounded-2xl transition-all duration-500
                      ${isActive ? 'opacity-100' : 'opacity-0'}
                    `}></div>

                    {/* Icon Container */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="relative mb-4">
                        {/* Glow behind icon */}
                        <div className={`
                          absolute inset-0 bg-[#10b5cb] rounded-2xl blur-xl transition-all duration-500
                          ${isActive ? 'opacity-30 scale-110' : 'opacity-0 scale-100'}
                        `}></div>
                        
                        {/* Icon background */}
                        <div className={`
                          relative w-16 h-16 md:w-20 md:h-20 
                          bg-gradient-to-br from-white to-gray-50
                          rounded-2xl flex items-center justify-center
                          transition-all duration-500
                          ${isActive ? 'shadow-lg' : 'shadow-md'}
                        `}>
                          <Icon className={`
                            w-8 h-8 md:w-10 md:h-10 text-[#10b5cb]
                            transition-all duration-500
                            ${isActive ? 'scale-110' : 'scale-100'}
                          `} />
                        </div>

                        {/* Decorative ring */}
                        <div className={`
                          absolute -top-1 -left-1 w-[70px] h-[70px] md:w-[86px] md:h-[86px]
                          border-2 border-[#10b5cb] rounded-2xl
                          transition-all duration-500
                          ${isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}
                        `}></div>
                      </div>

                      {/* Category Name */}
                      <span className={`
                        text-sm md:text-base font-semibold text-center
                        transition-all duration-300
                        ${isActive ? 'text-[#10b5cb]' : 'text-gray-700'}
                      `}>
                        {cat.name}
                      </span>

                      {/* Underline */}
                      <div className={`
                        h-0.5 bg-[#10b5cb] rounded-full
                        transition-all duration-500
                        ${isActive ? 'w-8 mt-2' : 'w-0 mt-0'}
                      `}></div>

                      {/* Shop Now text */}
                      
                    </div>

                    {/* Shine Effect on Active */}
                    <div className={`
                      absolute inset-0 rounded-2xl overflow-hidden pointer-events-none
                      transition-opacity duration-500
                      ${isActive ? 'opacity-100' : 'opacity-0'}
                    `}>
                      <div className="absolute -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-shine"></div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Auto-move indicator */}
        

        {/* View All Categories Button */}
        
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            left: -150%;
          }
          100% {
            left: 150%;
          }
        }
        .animate-shine {
          animation: shine 0.6s ease-in-out forwards;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
        .animate-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}