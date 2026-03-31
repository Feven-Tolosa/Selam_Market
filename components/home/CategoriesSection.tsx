'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Smartphone, Shirt, Sofa, Laptop, Watch, Home } from 'lucide-react'
import type { Category } from '@/types'

// ✅ map icons to category slug
const iconMap: Record<string, React.ElementType> = {
  electronics: Smartphone,
  clothing: Shirt,
  furniture: Sofa,
  computers: Laptop,
  accessories: Watch,
  home: Home,
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .returns<Category[]>()

      if (!isMounted) return

      if (!error && data) {
        setCategories(data)
      }

      setLoading(false)
    }

    fetchCategories()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <p className='p-6'>Loading categories...</p>
  }

  return (
    <section className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-6'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-8'>
          Browse Categories
        </h2>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6'>
          {categories.map((cat) => {
            const Icon = iconMap[cat.id] || Home // fallback icon

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className='border rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#10b5cb] hover:shadow-md transition'
              >
                <div className='bg-[#10b5cb]/10 p-3 rounded-full mb-3'>
                  <Icon className='text-[#10b5cb]' size={22} />
                </div>

                <span className='text-gray-700 text-sm font-medium'>
                  {cat.name}
                </span>
                
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
