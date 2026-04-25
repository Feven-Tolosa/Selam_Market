'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import VendorsTable from '@/components/admin/VendorsTable'
import OrdersTable from '@/components/admin/OrdersTable'
import { Plus, Layers } from 'lucide-react'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

/* ---------------- TYPES ---------------- */

type Stats = {
  vendors: number
  products: number
  orders: number
  categories: number
}

type Category = {
  id: string
  name: string
  slug: string
  created_at: string
}

type Vendor = {
  id: string
  category_id: string | null
}

type Product = {
  id: string
  category_id: string | null
}

type Order = {
  id: string
  created_at: string
  status: string
}

const COLORS = ['#10b5cb', '#6366f1', '#f59e0b', '#ef4444', '#22c55e']

/* ---------------- MAIN ---------------- */

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    vendors: 0,
    products: 0,
    orders: 0,
    categories: 0,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false) // ✅ FIXED

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)

      const [
        { count: vendorsCount },
        { count: productsCount },
        { count: ordersCount },
        { count: categoriesCount },
        { data: categoriesData },
        { data: vendorsData },
        { data: productsData },
        { data: ordersData },
      ] = await Promise.all([
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*'),
        supabase.from('vendors').select('id, category_id'),
        supabase.from('products').select('id, category_id'),
        supabase.from('orders').select('id, created_at, status'),
      ])

      setStats({
        vendors: vendorsCount ?? 0,
        products: productsCount ?? 0,
        orders: ordersCount ?? 0,
        categories: categoriesCount ?? 0,
      })

      setCategories(categoriesData ?? [])
      setVendors(vendorsData ?? [])
      setProducts(productsData ?? [])
      setOrders(ordersData ?? [])

      setLoading(false)
    }

    fetchAll()
  }, [])

  /* ---------------- ANALYTICS ---------------- */

  const ordersTrend = useMemo(() => {
    const map: Record<string, number> = {}

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      map[d.toISOString().split('T')[0]] = 0
    }

    orders.forEach((o) => {
      const key = new Date(o.created_at).toISOString().split('T')[0]
      if (map[key] !== undefined) map[key]++
    })

    return Object.entries(map).map(([date, orders]) => ({
      date,
      orders,
    }))
  }, [orders])

  const productsPerCategory = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      value: products.filter((p) => p.category_id === c.id).length,
    }))
  }, [categories, products])

  const vendorAnalytics = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      value: vendors.filter((v) => v.category_id === c.id).length,
    }))
  }, [categories, vendors])

  /* ---------------- UI SAFETY ---------------- */

  if (loading) {
    return <div className='p-6'>Loading dashboard...</div>
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* HEADER */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        <p className='text-gray-500'>Marketplace analytics</p>
      </div>

      {/* STATS */}
      <div className='grid md:grid-cols-4 gap-4 mb-6'>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className='bg-white p-5 rounded-xl shadow-sm'>
            <p className='text-gray-500 text-sm capitalize'>{k}</p>
            <h2 className='text-2xl font-bold text-[#10b5cb]'>{v}</h2>
          </div>
        ))}
      </div>

      {/* ORDERS TREND */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 className='font-semibold mb-4'>Orders Trend</h2>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={ordersTrend}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Line dataKey='orders' stroke='#10b5cb' />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PRODUCTS */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 className='font-semibold mb-4'>Products per Category</h2>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={productsPerCategory}>
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='value' fill='#10b5cb' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART FIXED */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 className='font-semibold mb-4'>Vendors per Category</h2>

        {vendorAnalytics.length > 0 ? (
          <div className='h-[320px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={vendorAnalytics}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  outerRadius={110}
                  label
                >
                  {vendorAnalytics.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className='text-gray-400'>No vendor data</p>
        )}
      </div>

      {/* CATEGORY SECTION */}
      <div className='bg-white rounded-2xl shadow-sm mb-6 overflow-hidden'>
        {/* HEADER */}
        <div className='flex justify-between items-center p-5 border-b bg-gray-50/50'>
          <div className='flex items-center gap-2'>
            <Layers className='w-5 h-5 text-[#10b5cb]' />
            <h2 className='font-semibold text-gray-800 text-lg'>Categories</h2>
          </div>

          <button
            onClick={() => setShowCategoryModal(true)}
            className='bg-[#10b5cb] hover:bg-[#0ea5b7] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition'
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/* CONTENT */}
        <div className='p-5'>
          {categories.length === 0 ? (
            <div className='text-center py-10 text-gray-400'>
              <Layers className='w-10 h-10 mx-auto mb-2 opacity-40' />
              <p className='text-sm'>
                No categories yet. Add your first category.
              </p>
            </div>
          ) : (
            <div className='grid md:grid-cols-3 gap-4'>
              {categories.map((c) => (
                <div
                  key={c.id}
                  className='group bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#10b5cb]/30 transition p-4 rounded-xl shadow-sm hover:shadow-md'
                >
                  {/* CATEGORY NAME */}
                  <h3 className='font-semibold text-gray-800 group-hover:text-[#10b5cb] transition'>
                    {c.name}
                  </h3>

                  {/* SLUG (optional subtle UI improvement) */}
                  <p className='text-xs text-gray-400 mt-1'>/{c.slug}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL FIXED */}
      {showCategoryModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center'>
          <div className='bg-white p-5 rounded-xl w-[400px]'>
            <h2 className='font-semibold mb-3'>Add Category</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault()

                const form = new FormData(e.currentTarget)
                const name = form.get('name') as string

                if (!name) return

                const slug = name.toLowerCase().trim().replace(/\s+/g, '-')

                const { data, error } = await supabase
                  .from('categories')
                  .insert([{ name, slug }])
                  .select() // IMPORTANT FIX

                if (error) {
                  alert(error.message)
                  return
                }

                // DO NOT reload page
                setCategories((prev) => [...prev, ...(data ?? [])])

                setShowCategoryModal(false)
              }}
            >
              <input
                name='name'
                className='border w-full p-2 rounded mb-3'
                placeholder='Category name'
              />

              <button className='bg-[#10b5cb] text-white w-full py-2 rounded'>
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
