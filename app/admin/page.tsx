'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminStats from '@/components/admin/AdminStats'
import VendorsTable from '@/components/admin/VendorsTable'
import OrdersTable from '@/components/admin/OrdersTable'

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

  useEffect(() => {
    const fetchStats = async () => {
      const { count: vendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })

      const { count: products } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      const { count: orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      setStats({
        vendors: vendors ?? 0,
        products: products ?? 0,
        orders: orders ?? 0,
      })
    }

    fetchStats()
  }, [])

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Admin Dashboard</h1>

      <AdminStats stats={stats} />

      <div className='grid md:grid-cols-2 gap-6'>
        <VendorsTable />
        <OrdersTable />
      </div>
    </div>
  )
}
