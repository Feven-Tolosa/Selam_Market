import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const tx_ref = searchParams.get('tx_ref')

    if (!tx_ref) {
      return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 })
    }

    //  Verify payment
    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    )

    const payment = verifyRes.data.data

    if (payment.status !== 'success') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
      )
    }

    const userEmail = payment.email

    //  Get user
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (!user) throw new Error('User not found')

    //  Get active cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (!cart) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      )
    }

    //  Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('product_id, quantity, price')
      .eq('cart_id', cart.id)

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart empty')
    }

    //  Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        tx_ref,
        amount: payment.amount,
        status: 'paid',
        currency: payment.currency,
      })
      .select()
      .single()

    //  Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    await supabase.from('order_items').insert(orderItems)

    //  Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cart.id)

    //  Mark cart completed
    await supabase
      .from('carts')
      .update({ status: 'completed' })
      .eq('id', cart.id)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
    )
  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
