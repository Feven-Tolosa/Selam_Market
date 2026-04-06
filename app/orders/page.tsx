'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
}

type OrderItem = {
  id: string
  cart_id: string
  quantity: number
  product: Product
}

type OrderGroup = {
  cart_id: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: carts } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'ordered')

      if (!carts) return

      const cartIds = carts.map((c) => c.id)

      const { data } = await supabase
        .from('cart_items')
        .select(
          `
          id,
          cart_id,
          quantity,
          product:products (
            id,
            name,
            price,
            image_url
          )
        `,
        )
        .in('cart_id', cartIds)
        .eq('status', 'ordered')

      // ✅ SAFE FORMAT
      const items: OrderItem[] = (data || [])
        .map((item) => {
          const product = item.product?.[0]
          if (!product) return null

          return {
            id: item.id,
            cart_id: item.cart_id,
            quantity: item.quantity,
            product,
          }
        })
        .filter((item): item is OrderItem => item !== null)

      // Group
      const grouped: Record<string, OrderItem[]> = {}

      items.forEach((item) => {
        if (!grouped[item.cart_id]) grouped[item.cart_id] = []
        grouped[item.cart_id].push(item)
      })

      setOrders(
        Object.keys(grouped).map((cart_id) => ({
          cart_id,
          items: grouped[cart_id],
        })),
      )

      setLoading(false)
    }

    fetchOrders()
  }, [])

  if (loading) return <p className='p-8 text-center'>Loading...</p>

  if (!orders.length) return <p>No orders yet</p>

  return (
    <div className='max-w-6xl mx-auto p-8 space-y-6'>
      <h1 className='text-3xl font-bold'>Your Orders</h1>

      {orders.map((order) => {
        const total = order.items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        )

        return (
          <div key={order.cart_id} className='border p-6 rounded'>
            <h2>Order #{order.cart_id.slice(0, 6)}</h2>

            {order.items.map((item) => (
              <div key={item.id} className='flex gap-4'>
                <Image
                  src={item.product.image_url || '/placeholder.png'}
                  alt={item.product.name}
                  width={80}
                  height={80}
                />
                <div>
                  <p>{item.product.name}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
            ))}

            <p>Total: ${total.toFixed(2)}</p>
          </div>
        )
      })}
    </div>
  )
}
