'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
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

  // Fetch cart items
  useEffect(() => {
    if (!userId) return

    const fetchCartItems = async () => {
      setLoading(true)

      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single()

      if (!cart) {
        setCartItems([])
        setLoading(false)
        return
      }

      const { data: items } = await supabase
        .from('cart_items')
        .select(
          'id, cart_id, quantity, product(id,name,price,image_url,vendor_id)',
        )
        .eq('cart_id', cart.id)

      setCartItems(items || [])
      setLoading(false)
    }

    fetchCartItems()
  }, [userId])

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return
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
    if (!userId) return alert('Login required')
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  return (
    <div className='max-w-7xl mx-auto p-8 grid md:grid-cols-3 gap-8'>
      <h1 className='text-3xl font-bold '>
        Shopping Cart{' '}
        <span className='text-gray-500 text-lg font-normal'>
          ( {cartItems.length} items )
        </span>
      </h1>
      <p className='text-gray-500  md:col-span-3'>
        Review your items and proceed to checkout.
      </p>
      {/* LEFT: Cart Items */}
      <div className='md:col-span-2 space-y-4'>
        {cartItems.map((item) => (
          <div
            key={item.id}
            className='flex items-center gap-4 p-4 border rounded-lg hover:shadow-lg transition'
          >
            <Image
              src={item.product.image_url || '/placeholder.png'}
              alt={item.product.name}
              width={100}
              height={100}
              className='rounded-lg object-cover'
            />
            <div className='flex-1 space-y-1'>
              <h2 className='font-semibold text-lg'>{item.product.name}</h2>
              <p className='text-gray-500 text-sm'>
                Vendor: {item.product.vendor_id}
              </p>
              <p className='text-[#10b5cb] font-semibold text-lg'>
                ${item.product.price.toFixed(2)}
              </p>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <input
                type='number'
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.id, Number(e.target.value))
                }
                className='w-20 p-1 border rounded text-center'
              />
              <button
                onClick={() => removeItem(item.id)}
                className='text-red-500 hover:underline text-sm'
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: Order Summary */}
      <div className='border p-6 rounded-lg h-fit shadow-md space-y-4'>
        <h2 className='text-2xl font-semibold'>Order Summary</h2>
        <div className='flex justify-between text-lg'>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <hr />
        <div className='flex justify-between font-bold text-xl'>
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={checkout}
          className='w-full bg-[#10b5cb] text-white py-3 rounded hover:bg-[#0da0b5] transition font-semibold'
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}
