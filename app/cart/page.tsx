'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
}

type CartItem = {
  id: string
  cart_id: string
  product: Product | null
  quantity: number
  status: 'cart' | 'ordered'
}

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

  /* ---------------- USER ---------------- */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
        setUserEmail(data.user.email ?? null)
      }
    }
    getUser()
  }, [])

  /* ---------------- FETCH CART ---------------- */
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

      const enriched: CartItem[] =
        (items as RawCartItem[])?.map((item) => {
          const product = Array.isArray(item.product)
            ? (item.product[0] ?? null)
            : item.product

          const cart = carts.find((c) => c.id === item.cart_id)

          return {
            id: item.id,
            cart_id: item.cart_id,
            quantity: item.quantity,
            product,
            status: cart?.status === 'pending' ? 'cart' : 'ordered',
          }
        }) ?? []

      setCartItems(enriched)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  /* ---------------- VISIBILITY REFRESH ---------------- */
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) fetchCartItems()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchCartItems])

  /* ---------------- RECOMMENDED ---------------- */
  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .limit(4)
      .then(({ data }) => data && setRecommendedProducts(data))
  }, [])

  /* ---------------- DERIVED STATE ---------------- */
  const cartProducts = useMemo(
    () => cartItems.filter((i) => i.status === 'cart'),
    [cartItems],
  )

  const vendorsMap = useMemo(() => {
    const map: Record<string, CartItem[]> = {}

    cartProducts.forEach((item) => {
      const vendorId = item.product?.vendor_id || 'unknown'
      if (!map[vendorId]) map[vendorId] = []
      map[vendorId].push(item)
    })

    return map
  }, [cartProducts])

  const subtotal = useMemo(
    () =>
      cartProducts.reduce(
        (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
        0,
      ),
    [cartProducts],
  )

  /* ---------------- ACTIONS ---------------- */
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

    if (error) {
      setCartItems(prev)
      toast.error('Update failed')
    }

    setUpdatingId(null)
  }

  const removeItem = async (id: string) => {
    const prev = [...cartItems]

    setCartItems((items) => items.filter((i) => i.id !== id))

    const { error } = await supabase.from('cart_items').delete().eq('id', id)

    if (error) {
      setCartItems(prev)
      toast.error('Remove failed')
    }
  }

  const handleCheckout = async () => {
    if (!userEmail) return toast.error('Login required')

    if (!cartProducts.length) return toast.error('Cart is empty')

    setCheckingOut(true)

    const items: CheckoutItem[] = cartProducts
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
        body: JSON.stringify({ items, userEmail, userId }),
      })

      const data = await res.json()

      if (data.checkout_url) {
        window.location.href = data.checkout_url
        return
      }

      toast.error(data.error || 'Checkout failed')
    } catch {
      toast.error('Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  /* ---------------- UI ---------------- */
  if (loading) return <p className='p-8 text-center'>Loading cart...</p>

  if (!cartProducts.length)
    return (
      <div className='p-12 text-center'>
        <h1 className='text-2xl font-bold mb-4'>Your cart is empty 🛒</h1>
        <Link href='/products' className='text-[#10b5cb]'>
          Continue Shopping
        </Link>
      </div>
    )

  return (
    <div className='max-w-7xl mx-auto p-8 space-y-8'>
      <h1 className='text-3xl font-bold'>
        Shopping Cart ({cartProducts.length})
      </h1>

      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2 space-y-6'>
          {Object.entries(vendorsMap).map(([vendorId, items]) => {
            const vendorTotal = items.reduce(
              (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
              0,
            )

            return (
              <div key={vendorId} className='border p-4 rounded-lg'>
                <h2 className='font-semibold mb-2'>
                  Vendor: {vendorId.slice(0, 6)}...
                </h2>

                {items.map((item) => {
                  const p = item.product
                  if (!p) return null

                  return (
                    <div
                      key={item.id}
                      className='flex items-center gap-4 border-b py-2'
                    >
                      <Image
                        src={p.image_url || '/placeholder.png'}
                        alt={p.name}
                        width={90}
                        height={90}
                        className='rounded'
                      />

                      <div className='flex-1'>
                        <h3>{p.name}</h3>
                        <p className='text-[#10b5cb]'>ETB {p.price}</p>
                      </div>

                      <input
                        type='number'
                        min={1}
                        value={item.quantity}
                        disabled={updatingId === item.id}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                        className='w-16 border text-center'
                      />

                      <button
                        onClick={() => removeItem(item.id)}
                        className='text-red-500'
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}

                <div className='text-right font-semibold mt-2'>
                  Vendor Total: ETB {vendorTotal.toFixed(2)}
                </div>
              </div>
            )
          })}
        </div>

        <div className='border p-6 rounded-lg space-y-4 h-fit'>
          <h2 className='text-xl font-semibold'>Order Summary</h2>

          <div className='flex justify-between'>
            <span>Subtotal</span>
            <span>ETB {subtotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className='w-full bg-[#10b5cb] text-white py-3 rounded'
          >
            {checkingOut ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}
