'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Product, Category } from '@/types'
import ProductCard from '@/components/product/ProductCard'

type product = {
  category_name?: string
  rating?: number
  ratingCount?: number
}
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')

  useEffect(() => {
    async function fetchData() {
      // products + categories
      const { data: p } = await supabase.from('products').select('*')
      const { data: c } = await supabase.from('categories').select('*')

      // ratings
      const { data: r } = await supabase
        .from('reviews')
        .select('product_id, rating')

      // build rating map
      const map: Record<string, { total: number; count: number }> = {}

      r?.forEach((rev) => {
        if (!map[rev.product_id]) {
          map[rev.product_id] = { total: 0, count: 0 }
        }
        map[rev.product_id].total += rev.rating
        map[rev.product_id].count++
      })

      // attach ratings to products
      const productsWithRatings =
        p?.map((prod) => {
          const stats = map[prod.id]

          return {
            ...prod,
            rating: stats ? stats.total / stats.count : 0,
            ratingCount: stats ? stats.count : 0,
          }
        }) || []

      setProducts(productsWithRatings)
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

  if (sort === 'rating') {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-10'>
      {/* TOP BAR */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        {/* SEARCH */}
        <input
          type='text'
          placeholder='Search products...'
          className='border rounded-lg px-4 py-2 w-full md:w-2/3 focus:ring-2 focus:ring-[#10b5cb]'
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
          <option value='rating'>Top Rated</option>
        </select>
      </div>

      {/* GRID */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
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
