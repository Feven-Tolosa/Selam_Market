'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import VendorsTable from '@/components/admin/VendorsTable'
import OrdersTable from '@/components/admin/OrdersTable'
import { Plus, Edit, Trash2, Layers } from 'lucide-react'

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

/* ---------------- COLORS ---------------- */

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

  /* ---------------- FETCH ---------------- */

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

  // Orders trend
  const ordersTrend = useMemo(() => {
    const map: Record<string, number> = {}

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      map[key] = 0
    }

    orders.forEach((o) => {
      const key = new Date(o.created_at).toISOString().split('T')[0]
      if (map[key] !== undefined) map[key]++
    })

    return Object.entries(map).map(([date, value]) => ({
      date,
      orders: value,
    }))
  }, [orders])

  // PRODUCTS PER CATEGORY
  const productsPerCategory = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      value: products.filter((p) => p.category_id === c.id).length,
    }))
  }, [categories, products])

  // 🔥 NEW: VENDOR ANALYTICS (replaces order status pie chart)
  const vendorAnalytics = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      value: vendors.filter((v) => v.category_id === c.id).length,
    }))
  }, [categories, vendors])

  /* ---------------- UI ---------------- */

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* HEADER */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
        <p className='text-gray-500'>Modern marketplace analytics</p>
      </div>

      {/* STATS */}
      <div className='grid md:grid-cols-4 gap-4 mb-6'>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className='bg-white p-5 rounded-xl shadow-sm'>
            <p className='text-gray-500 text-sm capitalize'>{key}</p>
            <h2 className='text-2xl font-bold text-[#10b5cb]'>{value}</h2>
          </div>
        ))}
      </div>

      {/* ---------------- CHARTS ---------------- */}

      {/* ORDERS TREND */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 className='font-semibold mb-4'>Orders Trend</h2>

        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={ordersTrend}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Line type='monotone' dataKey='orders' stroke='#10b5cb' />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PRODUCTS PER CATEGORY */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 className='font-semibold mb-4'>Products per Category</h2>

        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={productsPerCategory}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='value' fill='#10b5cb' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 VENDOR ANALYTICS (REPLACED PIE CHART) */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 className='font-semibold mb-4'>Vendors per Category (Analytics)</h2>

        <div className='flex justify-center'>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={vendorAnalytics}
                dataKey='value'
                nameKey='name'
                outerRadius={120}
              >
                {vendorAnalytics.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------- CATEGORY SECTION (MODERN GRID) ---------------- */}

      <div className='bg-white rounded-xl shadow-sm mb-6 overflow-hidden'>
        <div className='flex items-center justify-between p-5 border-b'>
          <div className='flex items-center gap-2'>
            <Layers className='w-5 h-5 text-[#10b5cb]' />
            <h2 className='font-semibold text-gray-800'>Categories Overview</h2>
          </div>

          <button className='bg-[#10b5cb] text-white px-4 py-2 rounded-lg text-sm'>
            <Plus size={16} className='inline mr-1' />
            Add Category
          </button>
        </div>

        <div className='p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {categories.map((cat) => {
            const productCount = products.filter(
              (p) => p.category_id === cat.id,
            ).length
            const vendorCount = vendors.filter(
              (v) => v.category_id === cat.id,
            ).length

            return (
              <div key={cat.id} className='bg-gray-50 p-4 rounded-xl border'>
                <h3 className='font-semibold'>{cat.name}</h3>
                <p className='text-xs text-gray-400'>/{cat.slug}</p>

                <div className='mt-3 grid grid-cols-2 gap-2'>
                  <div className='bg-white p-2 rounded text-center'>
                    <p className='text-xs text-gray-400'>Products</p>
                    <p className='font-bold text-[#10b5cb]'>{productCount}</p>
                  </div>

                  <div className='bg-white p-2 rounded text-center'>
                    <p className='text-xs text-gray-400'>Vendors</p>
                    <p className='font-bold text-purple-500'>{vendorCount}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ---------------- TABLES ---------------- */}

      <div className='grid lg:grid-cols-2 gap-6'>
        <div className='bg-white p-4 rounded-xl shadow-sm'>
          <h2 className='font-semibold mb-3'>Vendors</h2>
          <VendorsTable />
        </div>

        <div className='bg-white p-4 rounded-xl shadow-sm'>
          <h2 className='font-semibold mb-3'>Orders</h2>
          <OrdersTable />
        </div>
      </div>
    </div>
  )
}
