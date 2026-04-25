'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import VendorsTable from '@/components/admin/VendorsTable'
import OrdersTable from '@/components/admin/OrdersTable'
import { Layers } from 'lucide-react'

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
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)

      const [
        { count: vendors },
        { count: productsCount },
        { count: ordersCount },
        { count: categoriesCount },
        { data: categoriesData },
        { data: productsData },
        { data: ordersData },
      ] = await Promise.all([
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*'),
        supabase.from('products').select('id, category_id'),
        supabase.from('orders').select('id, created_at, status'),
      ])

      setStats({
        vendors: vendors ?? 0,
        products: productsCount ?? 0,
        orders: ordersCount ?? 0,
        categories: categoriesCount ?? 0,
      })

      setCategories(categoriesData ?? [])
      setProducts(productsData ?? [])
      setOrders(ordersData ?? [])

      setLoading(false)
    }

    fetchAll()
  }, [])

  /* ---------------- ANALYTICS ---------------- */

  // Products per category (REAL FEATURE)
  const productsPerCategory = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.name,
      value: products.filter((p) => p.category_id === cat.id).length,
    }))
  }, [categories, products])

  // Orders trend
  const ordersLast7Days = useMemo(() => {
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

  // Order status
  const orderStatus = useMemo(() => {
    const map: Record<string, number> = {}

    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1
    })

    return Object.entries(map).map(([status, value]) => ({
      status,
      value,
    }))
  }, [orders])

  /* ---------------- UI ---------------- */

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* HEADER */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
        <p className='text-gray-500'>Real-time marketplace analytics</p>
      </div>

      {/* STATS */}
      <div className='grid md:grid-cols-4 gap-4 mb-8'>
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className='bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition'
          >
            <p className='text-gray-500 text-sm capitalize'>{key}</p>
            <h2 className='text-3xl font-bold text-[#10b5cb]'>{value}</h2>
          </div>
        ))}
      </div>

      {/* ---------------- CHARTS (ONE PER ROW) ---------------- */}

      {/* ORDERS TREND */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <h2 className='font-semibold mb-4'>Orders Trend (7 Days)</h2>

        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={ordersLast7Days}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Line type='monotone' dataKey='orders' stroke='#10b5cb' />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PRODUCTS PER CATEGORY (IMPORTANT REAL FEATURE) */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Layers className='w-5 h-5 text-[#10b5cb]' />
          <h2 className='font-semibold'>Products per Category</h2>
        </div>

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

      {/* ORDER STATUS */}
      <div className='bg-white p-5 rounded-xl shadow-sm mb-8'>
        <h2 className='font-semibold mb-4'>Order Status Breakdown</h2>

        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={orderStatus}
              dataKey='value'
              nameKey='status'
              outerRadius={120}
            >
              {orderStatus.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
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
