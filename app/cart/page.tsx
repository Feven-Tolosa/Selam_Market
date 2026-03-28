'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import toast from 'react-hot-toast'

type CartItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
  }
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadCart = async () => {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      toast.error('Please login')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        quantity,
        product:products (
          id,
          name,
          price,
          image_url
        )
      `,
      )
      .eq('user_id', userData.user.id)

    if (error) {
      toast.error('Failed to load cart')
      setLoading(false)
      return
    }

    const formatted: CartItem[] = (data || []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: Array.isArray(item.product) ? item.product[0] : item.product,
    }))

    setCart(formatted)
    setLoading(false)
  }

  useEffect(() => {
    loadCart()
  }, [])

  // ➕ Increase quantity
  const increaseQty = async (id: string, qty: number) => {
    await supabase
      .from('cart_items')
      .update({ quantity: qty + 1 })
      .eq('id', id)

    loadCart()
  }

  // ➖ Decrease quantity
  const decreaseQty = async (id: string, qty: number) => {
    if (qty <= 1) return

    await supabase
      .from('cart_items')
      .update({ quantity: qty - 1 })
      .eq('id', id)

    loadCart()
  }

  // ❌ Remove item
  const removeItem = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id)
    toast.success('Removed')
    loadCart()
  }

  // 💰 Total price
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  if (loading) {
    return <p className='p-10'>Loading cart...</p>
  }

  if (cart.length === 0) {
    return (
      <div className='p-10 text-center'>
        <h2 className='text-xl font-semibold'>Your cart is empty 🛒</h2>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10'>
      {/* 🛒 ITEMS */}
      <div className='md:col-span-2 space-y-6'>
        <h1 className='text-2xl font-bold'>Your Cart</h1>

        {cart.map((item) => (
          <div
            key={item.id}
            className='flex gap-4 border rounded-xl p-4 items-center'
          >
            <Image
              src={item.product.image_url || '/placeholder.png'}
              alt={item.product.name}
              width={100}
              height={100}
              className='rounded-lg object-cover'
            />

            <div className='flex-1'>
              <h2 className='font-semibold'>{item.product.name}</h2>
              <p className='text-[#10b5cb] font-medium'>
                ${item.product.price.toFixed(2)}
              </p>

              {/* Quantity controls */}
              <div className='flex items-center gap-3 mt-2'>
                <button
                  onClick={() => decreaseQty(item.id, item.quantity)}
                  className='px-2 py-1 border rounded'
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => increaseQty(item.id, item.quantity)}
                  className='px-2 py-1 border rounded'
                >
                  +
                </button>
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.id)}
              className='text-red-500 text-sm'
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* 💳 SUMMARY */}
      <div className='border rounded-xl p-6 h-fit space-y-4'>
        <h2 className='text-lg font-semibold'>Order Summary</h2>

        <div className='flex justify-between'>
          <span>Items</span>
          <span>{cart.length}</span>
        </div>

        <div className='flex justify-between font-semibold text-lg'>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <button
          className='w-full py-3 bg-[#10b5cb] text-white rounded-xl hover:opacity-90'
          onClick={() => alert('Checkout coming next 🚀')}
        >
          Checkout
        </button>
      </div>
    </div>
  )
}
