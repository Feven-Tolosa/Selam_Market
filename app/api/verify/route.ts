import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

type ChapaVerifyResponse = {
  status: string
  data: {
    tx_ref: string
    amount: number
    currency: string
    status: string
    customer: {
      email: string
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tx_ref = searchParams.get('tx_ref')

  if (!tx_ref) {
    return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 })
  }

  try {
    const response = await axios.get<ChapaVerifyResponse>(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    )

    const payment = response.data.data

    if (payment.status !== 'success') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
      )
    }

    // ✅ Prevent duplicate orders
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('tx_ref', tx_ref)
      .maybeSingle()

    if (existing) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      )
    }

    // ✅ Insert order
    const { error } = await supabase.from('orders').insert({
      tx_ref: payment.tx_ref,
      amount: payment.amount,
      currency: payment.currency,
      status: 'paid',
      customer_email: payment.customer.email,
    })

    if (error) {
      console.error('DB insert error:', error.message)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
      )
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`,
    )
  }
}
