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
  category_name?: string
}

type CartItem = {
  id: string
  cart_id: string
  product: Product | null
  quantity: number
  status?: 'cart' | 'ordered' // ✅ New: tag to differentiate ordered vs cart items
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

  // ✅ Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Auth error:', error.message)
        return
      }
      setUserId(data.user?.id ?? null)
      setUserEmail(data.user?.email ?? null)
    }
    getUser()
  }, [])

  // ✅ Fetch cart items
 useEffect(() => {
  if (!userId) return;

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      // 🔹 Get all carts for user
      const { data: carts, error: cartsError } = await supabase
        .from('carts')
        .select('id, status')
        .eq('user_id', userId);

      if (cartsError || !carts) {
        setCartItems([]);
        return;
      }

      // 🔹 Get all items from all carts
      let allItems: CartItem[] = [];

      for (const cart of carts) {
        const { data: items, error: itemsError } = await supabase
          .from('cart_items')
          .select(
            'id, cart_id, quantity, product:product_id(id,name,price,image_url,vendor_id)'
          )
          .eq('cart_id', cart.id);

        if (itemsError) {
          console.error(itemsError.message);
          continue;
        }

        // 🔹 Add status based on cart.status
        const taggedItems = (items ?? []).map((item) => ({
          ...item,
          status: cart.status === 'pending' ? 'cart' : 'ordered',
        }));

        allItems = [...allItems, ...taggedItems];
      }

      setCartItems(allItems);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchCartItems();
}, [userId]);

  // ✅ Fetch recommended products (simple example)
  useEffect(() => {
    const fetchRecommended = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4) // show 4 recommendations
      if (!error) setRecommendedProducts(data ?? [])
    }
    fetchRecommended()
  }, [])

  // ✅ Update quantity
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return
    setUpdatingId(cartItemId)
    const prev = [...cartItems]
    setCartItems((items) =>
      items.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    )
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
    if (error) {
      console.error(error.message)
      setCartItems(prev)
    }
    setUpdatingId(null)
  }

  // ✅ Remove item
  const removeItem = async (cartItemId: string) => {
    const prev = [...cartItems]
    setCartItems((items) => items.filter((item) => item.id !== cartItemId))
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId)
    if (error) {
      console.error(error.message)
      setCartItems(prev)
    }
  }

  // ✅ Checkout
  const handleCheckout = async () => {
    if (!userEmail) return alert('Please login to continue')
    if (cartItems.length === 0) return alert('Cart is empty')

    setCheckingOut(true)
    try {
      const cleanItems: CheckoutItem[] = cartItems
        .filter((item) => item.product !== null)
        .map((item) => ({
          id: item.product!.id,
          name: item.product!.name,
          price: item.product!.price,
          quantity: item.quantity
        }))

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cleanItems, userEmail })
      })

      const data: { checkout_url?: string; error?: string } = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
      else alert('Failed to start payment')
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    } finally {
      setCheckingOut(false)
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

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  // ✅ Separate cart and ordered items
  const cartProducts = cartItems.filter((item) => item.status === 'cart')
  const orderedProducts = cartItems.filter((item) => item.status === 'ordered')

  return (
    <div className='max-w-7xl mx-auto p-8 space-y-8'>
      <h1 className='text-3xl font-bold'>
        Shopping Cart <span className='text-gray-500 text-lg font-normal'>({cartItems.length} items)</span>
      </h1>

      {/* CART ITEMS */}
      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2 space-y-4'>
          {cartProducts.map((item) => {
            const product = item.product
            if (!product) return null
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
                  <p className='text-[#10b5cb] font-semibold text-lg'>{product.price.toFixed(2)}</p>
                  <span className='text-sm text-green-600 font-medium'>In Cart</span>
                </div>
                <div className='flex flex-col items-center gap-2'>
                  <input
                    type='number'
                    min={1}
                    value={item.quantity}
                    disabled={updatingId === item.id}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
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

          {/* ORDERED ITEMS */}
          {orderedProducts.length > 0 && (
            <div className='mt-8'>
              <h2 className='text-2xl font-semibold mb-4'>Ordered Products</h2>
              {orderedProducts.map((item) => {
                const product = item.product
                if (!product) return null
                return (
                  <div
                    key={item.id}
                    className='flex items-center gap-4 p-4 border rounded-lg bg-gray-50'
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
                      <p className='text-gray-500 font-semibold text-lg'>{product.price.toFixed(2)}</p>
                      <span className='text-blue-600 font-medium'>Ordered</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div className='border p-6 rounded-lg h-fit shadow-md space-y-4'>
          <h2 className='text-2xl font-semibold'>Order Summary</h2>
          <div className='flex justify-between text-lg'>
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          <hr />
          <div className='flex justify-between font-bold text-xl'>
            <span>Total</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className='w-full bg-[#10b5cb] text-white py-3 rounded hover:bg-[#0da0b5] transition font-semibold disabled:opacity-50'
          >
            {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS */}
      {recommendedProducts.length > 0 && (
        <div className='mt-12'>
          <h2 className='text-2xl font-semibold mb-4'>Recommended for You</h2>
          <div className='grid md:grid-cols-4 gap-6'>
            {recommendedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className='border p-4 rounded-lg hover:shadow-lg transition flex flex-col items-center'
              >
                <Image
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  width={150}
                  height={150}
                  className='object-cover rounded-lg'
                />
                <h3 className='mt-2 font-semibold text-center'>{product.name}</h3>
                <p className='text-[#10b5cb] font-semibold mt-1'>{product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}