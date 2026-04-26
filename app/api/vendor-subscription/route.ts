import { NextResponse } from 'next/server'
import axios, { AxiosError } from 'axios'

type SubscriptionRequest = {
  vendorId: string
  email: string
}

type ChapaInitResponse = {
  data: {
    checkout_url: string
  }
}

export async function POST(req: Request) {
  try {
    const body: SubscriptionRequest = await req.json()
    const { vendorId, email } = body

    // ✅ Validation
    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendorId' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    // ✅ Config
    const amount = 29
    const currency = 'ETB'
    const shortVendorId = vendorId.slice(0, 8)
    const tx_ref = `sub-${shortVendorId}-${Date.now()}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    // ⚠️ Important: ensure baseUrl exists
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Server misconfiguration (BASE URL missing)' },
        { status: 500 },
      )
    }

    // ✅ Chapa request
    const response = await axios.post<ChapaInitResponse>(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount,
        currency,
        email,
        tx_ref,

        // ✅ Same structure as cart checkout
        callback_url: `${baseUrl}/api/verify-subscription`,
        return_url: `${baseUrl}/vendor/subscription/success`,

        customization: {
          title: 'Selam Market',
          description: 'Vendor Monthly Subscription',
        },

        metadata: {
          vendorId,
          type: 'subscription',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    )

    const checkoutUrl = response.data?.data?.checkout_url

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 },
      )
    }

    return NextResponse.json({ checkout_url: checkoutUrl })
  } catch (error) {
    const err = error as AxiosError

    console.error(
      'Subscription checkout error:',
      err.response?.data || err.message,
    )

    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 },
    )
  }
}
