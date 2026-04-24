'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

/* ================= TYPES ================= */

type ProductInfo = {
  name: string
  image_url: string | null
}

type OrderInfo = {
  id: string
  user_id: string
  email: string
  total: number
  status: string
  created_at: string
}

type OrderItemRow = {
  id: string
  order_id: string
  vendor_id: string
  quantity: number
  price: number
  product: ProductInfo | null
  order: OrderInfo | null
}

type OrderItem = {
  id: string
  order_id: string
  vendor_id: string
  quantity: number
  price: number
  product: ProductInfo
}

type Order = OrderInfo & {
  items: OrderItem[]
}

/* ================= COMPONENT ================= */

export default function VendorOrdersPage() {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  /* ========= GET VENDOR ========= */
  useEffect(() => {
    const loadVendor = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) return

      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      setVendorId(vendor?.id ?? null)
    }

    loadVendor()
  }, [])

  /* ========= FETCH ORDERS ========= */
  const fetchOrders = async () => {
    if (!vendorId) return

    setLoading(true)

    const { data, error } = await supabase
      .from('order_items')
      .select(
        `
        id,
        order_id,
        vendor_id,
        quantity,
        price,
        product:product_id(name,image_url),
        order:orders(id,user_id,email,total,status,created_at)
      `,
      )
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch orders error:', error)
      setLoading(false)
      return
    }

    const rows = (data ?? []) as OrderItemRow[]

    const map: Record<string, Order> = {}

    rows.forEach((item) => {
      if (!item.order || !item.product) return

      const order = item.order

      if (!map[order.id]) {
        map[order.id] = {
          ...order,
          items: [],
        }
      }

      map[order.id].items.push({
        id: item.id,
        order_id: item.order_id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
      })
    })

    setOrders(Object.values(map))
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [vendorId])

  /* ========= REALTIME ========= */
  useEffect(() => {
    if (!vendorId) return

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
          filter: `vendor_id=eq.${vendorId}`,
        },
        () => {
          fetchOrders()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [vendorId])

  /* ========= UPDATE STATUS ========= */
  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      console.error('Update status error:', error)
      return
    }

    fetchOrders()
  }

  /* ================= UI ================= */

  if (loading) {
    return <p className='p-6'>Loading orders...</p>
  }

  if (orders.length === 0) {
    return (
      <div className='p-10 text-center'>
        <h2 className='text-xl font-semibold text-gray-600'>
          No orders yet 📦
        </h2>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold text-[#10b5cb]'>Vendor Orders</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className='border rounded-xl p-4 bg-white shadow-sm'
        >
          {/* HEADER */}
          <div className='flex justify-between items-center mb-3'>
            <div>
              <p className='font-semibold'>Order #{order.id.slice(0, 8)}</p>
              <p className='text-sm text-gray-500'>{order.email}</p>
            </div>

            <div className='flex items-center gap-3'>
              <span className='px-3 py-1 rounded bg-gray-100 text-sm'>
                {order.status}
              </span>

              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className='border rounded px-2 py-1 text-sm'
              >
                <option value='paid'>Paid</option>
                <option value='processing'>Processing</option>
                <option value='shipped'>Shipped</option>
                <option value='delivered'>Delivered</option>
              </select>
            </div>
          </div>

          {/* ITEMS */}
          <div className='space-y-3'>
            {order.items.map((item) => (
              <div
                key={item.id}
                className='flex items-center gap-4 border-t pt-2'
              >
                <img
                  src={item.product.image_url || '/placeholder.png'}
                  className='w-14 h-14 rounded object-cover'
                />

                <div className='flex-1'>
                  <p className='font-medium'>{item.product.name}</p>
                  <p className='text-sm text-gray-500'>Qty: {item.quantity}</p>
                </div>

                <p className='font-semibold'>
                  ETB {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className='text-right mt-4 font-bold text-lg'>
            Total: ETB {order.total.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}
