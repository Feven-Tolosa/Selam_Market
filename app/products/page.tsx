'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Category } from '@/types'
import ProductCard from '@/components/product/ProductCard'

type ProductWithExtras = {
  id: string
  name: string
  price: number
  image_url: string | null
  category_id: string
  category_name?: string

  rating?: number
  ratingCount?: number
  distance?: number

  vendors?: {
    latitude: number
    longitude: number
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithExtras[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  )

  // 📍 Get user location
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => console.log('Location denied'),
    )
  }

  // 📏 Distance
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // 📍 Trigger location when "Nearby" selected
  useEffect(() => {
    if (sort === 'nearby' && !coords) {
      getUserLocation()
    }
  }, [sort])

  // 📦 Fetch data
  useEffect(() => {
    async function fetchData() {
      // products + vendor location
      const { data: p } = await supabase.from('products').select(`
        *,
        vendors (
          latitude,
          longitude
        )
      `)

      const { data: c } = await supabase.from('categories').select('*')

      const { data: r } = await supabase
        .from('reviews')
        .select('product_id, rating')

      // ⭐ rating map
      const map: Record<string, { total: number; count: number }> = {}

      r?.forEach((rev) => {
        if (!map[rev.product_id]) {
          map[rev.product_id] = { total: 0, count: 0 }
        }
        map[rev.product_id].total += rev.rating
        map[rev.product_id].count++
      })

      const enriched =
        p?.map((prod) => {
          const stats = map[prod.id]

          return {
            ...prod,
            rating: stats ? stats.total / stats.count : 0,
            ratingCount: stats ? stats.count : 0,
          }
        }) || []

      setProducts(enriched)
      setCategories(c || [])
    }

    fetchData()
  }, [])

  // 🔍 FILTER + SORT
  let filtered = [...products]

  if (selectedCategory !== 'all') {
    filtered = filtered.filter((p) => p.category_id === selectedCategory)
  }

  if (search) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // sorting
  if (sort === 'low') {
    filtered.sort((a, b) => a.price - b.price)
  }

  if (sort === 'high') {
    filtered.sort((a, b) => b.price - a.price)
  }

  if (sort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  // 📍 nearby sorting
  if (sort === 'nearby' && coords) {
    filtered = filtered
      .map((p) => {
        if (!p.vendors) return p

        const distance = getDistance(
          coords.lat,
          coords.lng,
          p.vendors.latitude,
          p.vendors.longitude,
        )

        return { ...p, distance }
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-10'>
      <h1 className='text-2xl font-bold mb-6 text-[#10b5cb]'>
        Explore Products
      </h1>

      {/* FILTERS */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <input
          type='text'
          placeholder='Search products...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border rounded-lg px-4 py-2 w-full md:w-2/3'
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='border rounded-lg px-3 py-2'
        >
          <option value='all'>All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className='border rounded-lg px-3 py-2'
        >
          <option value='latest'>Latest</option>
          <option value='low'>Price: Low → High</option>
          <option value='high'>Price: High → Low</option>
          <option value='rating'>Top Rated ⭐</option>
          <option value='nearby'>Nearby 📍</option>
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
