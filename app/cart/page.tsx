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
  product: Product | null
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ✅ Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Auth error:', error.message)
        return
      }
      setUserId(data.user?.id ?? null)
    }
    getUser()
  }, [])

  // ✅ Fetch cart items
  useEffect(() => {
    if (!userId) return

    const fetchCartItems = async () => {
      setLoading(true)

      try {
        const { data: cart, error: cartError } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'pending')
          .single()

        if (cartError || !cart) {
          setCartItems([])
          return
        }

        const { data: items, error: itemsError } = await supabase
          .from('cart_items')
          .select(
            'id, cart_id, quantity, product:product_id(id,name,price,image_url,vendor_id)',
          )
          .eq('cart_id', cart.id)

        if (itemsError) {
          console.error(itemsError.message)
          return
        }

        setCartItems(items ?? [])
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCartItems()
  }, [userId])

  // ✅ Update quantity (safe + UX improved)
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return

    setUpdatingId(cartItemId)

    const prev = [...cartItems]

    // optimistic update
    setCartItems((items) =>
      items.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    )

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)

    if (error) {
      console.error(error.message)
      setCartItems(prev) // rollback
    }

    setUpdatingId(null)
  }

  // ✅ Remove item
  const removeItem = async (cartItemId: string) => {
    const prev = [...cartItems]

    setCartItems((items) => items.filter((item) => item.id !== cartItemId))

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) {
      console.error(error.message)
      setCartItems(prev) // rollback
    }
  }

  // ✅ Checkout (safe)
  const checkout = async () => {
    if (!userId) {
      alert('Login required')
      return
    }

    if (cartItems.length === 0) {
      alert('Cart is empty')
      return
    }

    try {
      // 1. Calculate total safely
      const total = cartItems.reduce((sum, item) => {
        const price = item.product?.price ?? 0
        return sum + price * item.quantity
      }, 0)

      // 2. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: total,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError || !order) throw orderError

      // 3. Insert order items
      const orderItemsPayload = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product?.id,
        vendor_id: item.product?.vendor_id,
        quantity: item.quantity,
        price: item.product?.price ?? 0,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload)

      if (itemsError) throw itemsError

      // 4. Call backend (Chapa)
      const res = await fetch('/api/pay', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          amount: total,
          email: 'customer@email.com', // replace later
        }),
      })

      const data = await res.json()

      if (!data.checkout_url) throw new Error('Payment init failed')

      // 5. Redirect to payment
      window.location.href = data.checkout_url
    } catch (err) {
      console.error(err)
      alert('Checkout failed')
    }
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

  // ✅ Prevent crash if product is null
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  return (
    <div className='max-w-7xl mx-auto p-8 grid md:grid-cols-3 gap-8'>
      <h1 className='text-3xl font-bold md:col-span-3'>
        Shopping Cart{' '}
        <span className='text-gray-500 text-lg font-normal'>
          ({cartItems.length} items)
        </span>
      </h1>

      {/* LEFT */}
      <div className='md:col-span-2 space-y-4'>
        {cartItems.map((item) => {
          const product = item.product

          if (!product) return null // safety

          return (
            <div
              key={item.id}
              className='flex items-center gap-4 p-4 border rounded-lg hover:shadow-lg transition'
            >
              <Image
                src={product.image_url || '/placeholder.png'}
                alt={product.name}
                width={100}
                height={100}
                className='rounded-lg object-cover'
              />

              <div className='flex-1 space-y-1'>
                <h2 className='font-semibold text-lg'>{product.name}</h2>
                <p className='text-[#10b5cb] font-semibold text-lg'>
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <div className='flex flex-col items-center gap-2'>
                <input
                  type='number'
                  min={1}
                  value={item.quantity}
                  disabled={updatingId === item.id}
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
          )
        })}
      </div>

      {/* RIGHT */}
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
