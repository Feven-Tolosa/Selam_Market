import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      items,
      userEmail,
      cartId,
    }: { items: CartItem[]; userEmail: string; cartId: string } = body
    // await supabase
    //   .from('cart_items')
    //   .update({ status: 'ordered' })
    //   .eq('cart_id', cartId)

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 400 })
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    const tx_ref = `tx-${Date.now()}`

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: totalAmount,
        currency: 'ETB',
        email: userEmail,
        tx_ref,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
        customization: {
          title: 'Selam Market',
          description: 'Payment for your order',
        },
        metadata: {
          userEmail, // important
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    )

    return NextResponse.json({
      checkout_url: response.data.data.checkout_url,
      tx_ref,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Payment init failed' }, { status: 500 })
  }
}
