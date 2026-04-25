'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
  vendor_id: string
  category_name?: string
}

type CartItem = {
  id: string
  cart_id: string
  product: Product | null
  quantity: number
  status: 'cart' | 'ordered'
}

/**
 * Supabase raw response type (IMPORTANT FIX)
 * product may come as Product[] depending on join inference
 */
type RawCartItem = {
  id: string
  cart_id: string
  quantity: number
  product: Product | Product[] | null
}

type CheckoutItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!error && data.user) {
        setUserId(data.user.id)
        setUserEmail(data.user.email ?? null)
      }
    }
    getUser()
  }, [])

  const fetchCartItems = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    try {
      const { data: carts } = await supabase
        .from('carts')
        .select('id, status')
        .eq('user_id', userId)

      if (!carts?.length) {
        setCartItems([])
        return
      }

      const cartIds = carts.map((c) => c.id)

      const { data: items } = await supabase
        .from('cart_items')
        .select(
          'id, cart_id, quantity, product:product_id(id,name,price,image_url,vendor_id)',
        )
        .in('cart_id', cartIds)

      if (!items?.length) {
        setCartItems([])
        return
      }

      const enriched: CartItem[] = (items as RawCartItem[]).map((item) => {
        const cart = carts.find((c) => c.id === item.cart_id)

        // 🔥 FIX: normalize product (array → object)
        const product = Array.isArray(item.product)
          ? (item.product[0] ?? null)
          : item.product

        return {
          id: item.id,
          cart_id: item.cart_id,
          quantity: item.quantity,
          product,
          status: cart?.status !== 'pending' ? 'ordered' : 'cart',
        }
      })

      setCartItems(enriched)
    } catch (err) {
      console.error('Cart fetch error', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  useEffect(() => {
    const fetchRecommended = async () => {
      const { data } = await supabase.from('products').select('*').limit(4)
      if (data) setRecommendedProducts(data)
    }
    fetchRecommended()
  }, [])

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return
    setUpdatingId(id)

    const prev = [...cartItems]

    setCartItems((items) =>
      items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    )

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)

    if (error) setCartItems(prev)

    setUpdatingId(null)
  }

  const removeItem = async (id: string) => {
    const prev = [...cartItems]

    setCartItems((items) => items.filter((i) => i.id !== id))

    const { error } = await supabase.from('cart_items').delete().eq('id', id)

    if (error) setCartItems(prev)
  }

  const handleCheckout = async () => {
    if (!userEmail) return toast('Login required')

    const activeItems = cartItems.filter((i) => i.status === 'cart')
    if (!activeItems.length) return toast('No active cart items')

    setCheckingOut(true)

    const cleanItems: CheckoutItem[] = activeItems
      .filter((i) => i.product)
      .map((i) => ({
        id: i.product!.id,
        name: i.product!.name,
        price: i.product!.price,
        quantity: i.quantity,
      }))

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cleanItems,
          userEmail,
          userId,
        }),
      })

      const data: { checkout_url?: string } = await res.json()

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (err) {
      console.error(err)
      toast.error('Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) return <p className='p-8 text-center'>Loading cart...</p>

  if (!cartItems.length)
    return (
      <div className='p-12 text-center'>
        <h1 className='text-2xl font-bold mb-4'>Your cart is empty 🛒</h1>
        <Link href='/products' className='text-[#10b5cb] hover:underline'>
          Continue Shopping
        </Link>
      </div>
    )

  const cartProducts = cartItems.filter((i) => i.status === 'cart')

  const vendorsMap: Record<string, CartItem[]> = {}
  cartProducts.forEach((item) => {
    const vendorId = item.product?.vendor_id || 'unknown'
    if (!vendorsMap[vendorId]) vendorsMap[vendorId] = []
    vendorsMap[vendorId].push(item)
  })

  const subtotal = cartProducts.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
    0,
  )

  return (
    <div className='max-w-7xl mx-auto p-8 space-y-8'>
      <h1 className='text-3xl font-bold'>
        Shopping Cart ({cartProducts.length})
      </h1>

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2 space-y-6'>
          {Object.entries(vendorsMap).map(([vendorId, items]) => (
            <div key={vendorId} className='border rounded-lg p-4 space-y-4'>
              <h2 className='font-semibold text-xl'>
                Vendor: {vendorId.slice(0, 6)}...
              </h2>

              {items.map((item) => {
                const p = item.product
                if (!p) return null

                return (
                  <div
                    key={item.id}
                    className='flex items-center gap-4 border-b pb-2'
                  >
                    <Image
                      src={p.image_url || '/placeholder.png'}
                      alt={p.name}
                      width={100}
                      height={100}
                      className='rounded'
                    />

                    <div className='flex-1'>
                      <h3 className='font-semibold'>{p.name}</h3>
                      <p className='text-[#10b5cb]'>ETB {p.price.toFixed(2)}</p>
                    </div>

                    <input
                      type='number'
                      min={1}
                      value={item.quantity}
                      disabled={updatingId === item.id}
                      onChange={(e) =>
                        updateQuantity(
                          item.id,
                          Math.max(1, Number(e.target.value)),
                        )
                      }
                      className='w-20 border p-1 text-center'
                    />

                    <button
                      onClick={() => removeItem(item.id)}
                      className='text-red-500 text-sm'
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          ))}

          {/* RECOMMENDED PRODUCTS */}
          {recommendedProducts.length > 0 && (
            <div className='mt-12'>
              <h2 className='text-2xl font-semibold mb-4'>
                Recommended for You
              </h2>
              <div className='grid md:grid-cols-4 gap-6'>
                {recommendedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className='border p-4 rounded-lg hover:shadow-lg transition flex flex-col items-center'
                  >
                    <Image
                      src={p.image_url || '/placeholder.png'}
                      alt={p.name}
                      width={150}
                      height={150}
                      className='object-cover rounded-lg'
                    />
                    <h3 className='mt-2 font-semibold text-center'>{p.name}</h3>
                    <p className='text-[#10b5cb] font-semibold mt-1'>
                      {p.price.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='border p-6 rounded-lg space-y-4'>
          <h2 className='text-2xl font-semibold'>Order Summary</h2>

          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>ETB {subtotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className='w-full bg-[#10b5cb] text-white py-3 rounded'
          >
            {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}
