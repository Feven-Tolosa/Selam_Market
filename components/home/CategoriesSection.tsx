'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Smartphone, Shirt, Sofa, Laptop, Watch, Home } from 'lucide-react'
import { getTranslation } from '@/lib/i18n'

type Category = {
  id: string
  name: string
  slug?: string | null
}

const iconMap: Record<string, React.ElementType> = {
  electronics: Smartphone,
  clothing: Shirt,
  furniture: Sofa,
  computers: Laptop,
  accessories: Watch,
  home: Home,
}

export default function CategoriesSection() {
  const t = getTranslation()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')

      if (error) {
        console.error(error.message)
      } else {
        setCategories(data || [])
      }

      setLoading(false)
    }

    fetchCategories()
  }, [])

  if (loading) {
    return <p className='p-6'>{t.categoryPage.loading}</p>
  }

  return (
    <section className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-6'>
        <h2 className='text-2xl font-semibold mb-8'>{t.categoryPage.title}</h2>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6'>
          {categories.map((cat) => {
            const key =
              cat.slug?.toLowerCase() ||
              cat.name.toLowerCase().replace(/\s+/g, '')

            const Icon = iconMap[key] || Home

            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className='border rounded-xl p-6 flex flex-col items-center hover:border-[#10b5cb] hover:shadow-md transition'
              >
                <div className='bg-[#10b5cb]/10 p-3 rounded-full mb-3'>
                  <Icon className='text-[#10b5cb]' size={22} />
                </div>

                <span className='text-sm font-medium text-center'>
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
