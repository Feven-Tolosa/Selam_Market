import { NextResponse } from 'next/server'
import axios from 'axios'
import crypto from 'crypto'
import { supabase } from '@/lib/supabaseClient'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type CheckoutBody = {
  items: CartItem[]
  userEmail: string
  userId?: string
}

export async function POST(req: Request) {
  try {
    const body: CheckoutBody = await req.json()
    const { items, userEmail, userId } = body

    /* ---------------- VALIDATION ---------------- */
    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const invalidItem = items.find(
      (i) => !i.id || i.price <= 0 || i.quantity <= 0,
    )

    if (invalidItem) {
      return NextResponse.json(
        { error: 'Invalid cart item detected' },
        { status: 400 },
      )
    }

    /* ---------------- CALCULATE TOTAL ---------------- */
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    /* ---------------- SAFE tx_ref ---------------- */
    const tx_ref = `tx-${Date.now()}-${crypto.randomBytes(4).toString('hex')}` // short + unique

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

    const callbackUrl = `${baseUrl}/api/verify?tx_ref=${tx_ref}`
    const returnUrl = `${baseUrl}/payment-success?tx_ref=${tx_ref}`

    /* ---------------- SAVE TRANSACTION ---------------- */
    await supabase.from('transactions').insert({
      tx_ref,
      user_id: userId,
      email: userEmail,
      amount: totalAmount,
      status: 'pending',
      items,
    })

    /* ---------------- CALL CHAPA ---------------- */
    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: totalAmount,
        currency: 'ETB',
        email: userEmail,
        tx_ref,
        callback_url: callbackUrl,
        return_url: returnUrl,
        customization: {
          title: 'Selam Market',
          description: 'Secure checkout',
        },
        metadata: {
          userId,
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
    })
  } catch (error: any) {
    console.error('🔥 CHAPA ERROR:', error?.response?.data || error.message)

    return NextResponse.json(
      {
        error:
          error?.response?.data?.message || 'Payment initialization failed',
      },
      { status: 500 },
    )
  }
}
