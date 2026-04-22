import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tx_ref = searchParams.get('tx_ref')

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

    const userEmail = data.meta.userEmail

    // 1. Get user's cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*, product:product_id(*)')
      .eq('status', 'cart')

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'No cart items' })
    }

    const total = cartItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0,
    )

    // 2. Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        email: userEmail,
        total,
        status: 'paid',
      })
      .select()
      .single()

    // 3. Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      vendor_id: item.product.vendor_id,
      quantity: item.quantity,
      price: item.product.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    // 4. Clear cart
    await supabase.from('cart_items').delete().eq('status', 'cart')

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Verification failed' })
  }
}
