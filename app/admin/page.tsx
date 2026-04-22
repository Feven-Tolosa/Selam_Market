'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import VendorsTable from '@/components/admin/VendorsTable'
import OrdersTable from '@/components/admin/OrdersTable'

const Card = ({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: string
}) => (
  <div className='bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition'>
    <p className='text-sm text-gray-500'>{title}</p>
    <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
  </div>
)

type Stats = {
  vendors: number
  products: number
  orders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    vendors: 0,
    products: 0,
    orders: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      const [{ count: vendors }, { count: products }, { count: orders }] =
        await Promise.all([
          supabase.from('vendors').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
        ])

      setStats({
        vendors: vendors ?? 0,
        products: products ?? 0,
        orders: orders ?? 0,
      })

      setLoading(false)
    }

    fetchStats()
  }, [])

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
        <p className='text-gray-500 text-sm'>
          Overview of your marketplace activity
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className='text-gray-500'>Loading stats...</div>
      ) : (
        <div className='grid md:grid-cols-3 gap-4 mb-6'>
          <Card
            title='Total Vendors'
            value={stats.vendors}
            color='text-blue-600'
          />
          <Card
            title='Total Products'
            value={stats.products}
            color='text-green-600'
          />
          <Card
            title='Total Orders'
            value={stats.orders}
            color='text-purple-600'
          />
        </div>
      )}

      {/* Tables Section */}
      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Vendors */}
        <div className='bg-white rounded-xl shadow-sm p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='font-semibold text-gray-700'>Recent Vendors</h2>
          </div>
          <VendorsTable />
        </div>

        {/* Orders */}
        <div className='bg-white rounded-xl shadow-sm p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='font-semibold text-gray-700'>Recent Orders</h2>
          </div>
          <OrdersTable />
        </div>
      </div>
    </div>
  )
}
