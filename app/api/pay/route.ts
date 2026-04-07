import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: body.amount,
        currency: 'ETB',
        email: body.email,
        tx_ref: body.orderId,
        callback_url: 'http://localhost:3000/api/verify',
        return_url: 'http://localhost:3000/orders/success',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    )

    return NextResponse.json(response.data.data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
