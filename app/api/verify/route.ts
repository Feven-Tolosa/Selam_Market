import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tx_ref = searchParams.get('tx_ref')

  if (!tx_ref) {
    return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 })
  }

  try {
    const verify = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    )

    const data = verify.data.data

    if (data.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful' })
    }

    const userEmail = data.meta?.userEmail

    if (!userEmail) {
      return NextResponse.json({ error: 'Missing email in metadata' })
    }

    // ✅ 1. Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' })
    }

    // ✅ 2. Get user's carts
    const { data: carts } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (!carts || carts.length === 0) {
      return NextResponse.json({ error: 'No active cart' })
    }

    const cartIds = carts.map((c) => c.id)

    // ✅ 3. Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*, product:product_id(*)')
      .in('cart_id', cartIds)

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'No cart items' })
    }

    // ✅ 4. Calculate total
    const total = cartItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0,
    )

    // ✅ 5. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        email: userEmail,
        total,
        status: 'paid',
      })
      .select()
      .single()

    if (orderError) {
      console.error(orderError)
      return NextResponse.json({ error: 'Order creation failed' })
    }

    // ✅ 6. Create order items (THIS enables vendor dashboard)
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      vendor_id: item.product.vendor_id,
      quantity: item.quantity,
      price: item.product.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    // ✅ 7. CLEAN CART (FIXED)
    await supabase.from('cart_items').delete().in('cart_id', cartIds)

    // Optional: mark carts completed
    await supabase
      .from('carts')
      .update({ status: 'completed' })
      .in('id', cartIds)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
    )
  } catch (err) {
    console.error('Verification error:', err)
    return NextResponse.json({ error: 'Verification failed' })
  }
}
