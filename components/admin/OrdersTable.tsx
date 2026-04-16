'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Order = {
  id: string
  amount: number
  status: string
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, amount, status')
        .order('id', { ascending: false })
        .limit(5)

      setOrders(data ?? [])
    }

    fetchOrders()
  }, [])

  return (
    <div className='bg-white p-4 rounded-xl shadow'>
      <h2 className='font-semibold mb-4'>Recent Orders</h2>

      <div className='space-y-2'>
        {orders.map((o) => (
          <div key={o.id} className='border p-2 rounded'>
            <p>ID: {o.id}</p>
            <p>Amount: {o.amount}</p>
            <p>Status: {o.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
