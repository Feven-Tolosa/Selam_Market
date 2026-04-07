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
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    )

    const data = response.data.data

    if (data.status === 'success') {
      // Save order in DB
      await supabase.from('orders').insert({
        tx_ref,
        amount: data.amount,
        status: 'paid',
      })

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/paymentsuccess`,
      )
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/paymentfailed`,
      )
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
