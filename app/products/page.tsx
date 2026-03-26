'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Product, Category } from '@/types'
import Link from 'next/link'

type product = {
  category_name?: string
}
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')

  useEffect(() => {
    async function fetchData() {
      const { data: p } = await supabase.from('products').select('*')
      const { data: c } = await supabase.from('categories').select('*')

      setProducts(p || [])
      setCategories(c || [])
    }

    fetchData()
  }, [])

  // ✅ FILTER + SEARCH + SORT
  let filtered = products

  if (selectedCategory !== 'all') {
    filtered = filtered.filter((p) => p.category_id === selectedCategory)
  }

  if (search) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    )
  }

  if (sort === 'low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price)
  }

  if (sort === 'high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price)
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-10'>
      {/* TOP BAR */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        {/* SEARCH */}
        <input
          type='text'
          placeholder='Search products...'
          className='border rounded-lg px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-[#10b5cb]'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CATEGORY FILTER */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#10b5cb]'
        >
          <option value='all'>All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* SORT */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className='border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#10b5cb]'
        >
          <option value='latest'>Latest</option>
          <option value='low'>Price: Low → High</option>
          <option value='high'>Price: High → Low</option>
        </select>
      </div>

      {/* GRID */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className='group border rounded-xl overflow-hidden hover:shadow-lg transition bg-white cursor-pointer'
          >
            <img
              src={product.image_url || '/placeholder.png'}
              className='w-full h-48 object-cover group-hover:scale-105 transition'
            />

            <div className='p-4'>
              <h2 className='font-medium line-clamp-2'>{product.name}</h2>
              <p className='text-[#10b5cb] font-semibold mt-1'>
                ${product.price.toFixed(2)}
              </p>
              {product.category_name && (
                <p className='text-gray-500 text-sm mt-1'>
                  {product.category_name}
                </p>
              )}
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className='col-span-full text-center text-gray-500 mt-10'>
            No products found.
          </p>
        )}
      </div>
    </div>
  )
}
