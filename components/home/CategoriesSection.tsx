'use client'

import Link from 'next/link'
import { Smartphone, Shirt, Sofa, Laptop, Watch, Home } from 'lucide-react'

const categories = [
  { name: 'Electronics', icon: Smartphone, slug: 'electronics' },
  { name: 'Clothing', icon: Shirt, slug: 'clothing' },
  { name: 'Furniture', icon: Sofa, slug: 'furniture' },
  { name: 'Computers', icon: Laptop, slug: 'computers' },
  { name: 'Accessories', icon: Watch, slug: 'accessories' },
  { name: 'Home Goods', icon: Home, slug: 'home' },
]

export default function CategoriesSection() {
  return (
    <section className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-6'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-8'>
          Browse Categories
        </h2>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6'>
          {categories.map((cat) => {
            const Icon = cat.icon

            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className='border rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#10b5cb] hover:shadow-md transition cursor-pointer'
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
