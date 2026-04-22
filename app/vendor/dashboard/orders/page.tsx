'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: {
    name: string
  }
  order: {
    id: string
    email: string
    created_at: string
  }
}

export default function VendorOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [vendorId, setVendorId] = useState<string | null>(null)

  // get vendor user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setVendorId(data.user.id)
    }
    getUser()
  }, [])

  // fetch orders
  useEffect(() => {
    if (!vendorId) return

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('order_items')
        .select(
          `
          id,
          quantity,
          price,
          product:product_id(name),
          order:order_id(id,email,created_at)
          
        `,
        )
        .eq('vendor_id', vendorId)
        .order('order.created_at', { ascending: false })

      if (data) setOrders(data)
    }

    fetchOrders()
  }, [vendorId])

  if (!orders.length) {
    return <p className='p-6 text-center'>No orders yet</p>
  }

  return (
    <div className='max-w-5xl mx-auto p-8 space-y-6'>
      <h1 className='text-3xl font-bold'>Vendor Orders</h1>

      {orders.map((item) => (
        <div
          key={item.id}
          className='border rounded-lg p-4 flex justify-between items-center'
        >
          <div>
            <h2 className='font-semibold text-lg'>{item.product.name}</h2>
            <p>Qty: {item.quantity}</p>
            <p>Price: {item.price}</p>
          </div>

          <div className='text-right'>
            <p className='text-sm text-gray-500'>Order ID: {item.order.id}</p>
            <p className='text-sm'>{item.order.email}</p>
            <p className='text-xs text-gray-400'>
              {new Date(item.order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
