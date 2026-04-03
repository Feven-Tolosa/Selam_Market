'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  vendor_id: string
}

type CartItem = {
  id: string
  cart_id: string
  product: Product
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  // Fetch cart items for user
  useEffect(() => {
    if (!userId) return

    const fetchCart = async () => {
      setLoading(true)

      // Get user's pending cart
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .limit(1)
        .single()

      if (!cart) {
        setCartItems([])
        setLoading(false)
        return
      }

      // Get cart items with product details
      const { data: items } = await supabase
        .from('cart_items')
        .select(
          'id, cart_id, quantity, product(id,name,price,image_url,vendor_id)',
        )
        .eq('cart_id', cart.id)

      setCartItems(items || [])
      setLoading(false)
    }

    fetchCart()
  }, [userId])

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId)

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    )
  }

  const removeItem = async (cartItemId: string) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId)
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
  }

  const checkout = async () => {
    if (!userId) return alert('You must be logged in')

    // Mark cart items as ordered
    const cartId = cartItems[0]?.cart_id
    if (!cartId) return alert('Cart is empty')

    await supabase
      .from('cart_items')
      .update({ status: 'ordered' })
      .eq('cart_id', cartId)

    await supabase.from('carts').update({ status: 'ordered' }).eq('id', cartId)

    alert('Order placed! Vendors will be notified.')
    setCartItems([])
  }

  if (loading) return <p className='p-8 text-center'>Loading cart...</p>

  if (!cartItems.length)
    return (
      <div className='p-8 text-center'>
        <h1 className='text-2xl font-bold mb-4'>Your cart is empty</h1>
        <Link href='/' className='text-[#10b5cb] hover:underline'>
          Continue Shopping
        </Link>
      </div>
    )

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6'>Your Cart</h1>

      <div className='space-y-4'>
        {cartItems.map((item) => (
          <div
            key={item.id}
            className='flex items-center justify-between p-4 border rounded-lg'
          >
            <div className='flex items-center gap-4'>
              <Image
                src={item.product.image_url || '/placeholder.png'}
                alt={item.product.name}
                width={60}
                height={60}
                className='rounded-lg'
              />
              <div>
                <h2 className='font-semibold'>{item.product.name}</h2>
                <p>${item.product.price.toFixed(2)}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.id, Number(e.target.value))
                }
                className='w-16 p-1 border rounded text-center'
              />
              <button
                onClick={() => removeItem(item.id)}
                className='text-red-500 hover:underline'
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 flex justify-between items-center text-xl font-semibold'>
        <span>Total: ${total.toFixed(2)}</span>
        <button
          onClick={checkout}
          className='bg-[#10b5cb] text-white px-6 py-2 rounded hover:bg-[#0da0b5] transition'
        >
          Checkout
        </button>
      </div>
    </div>
  )
}
