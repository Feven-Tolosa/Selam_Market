import { NextResponse } from 'next/server'
import axios from 'axios'
import { supabase } from '@/lib/supabaseClient'

type ChapaMetadata = {
  userEmail?: string
  userId?: string
  [key: string]: unknown
}

type Product = {
  id: string
  name: string
  price: number
  vendor_id: string
  image_url?: string
}

type CartItemWithProduct = {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  product: Product
}

const getMetadata = (data: unknown): ChapaMetadata => {
  if (typeof data === 'object' && data !== null) {
    return (
      (data as { metadata?: ChapaMetadata; meta?: ChapaMetadata }).metadata ||
      (data as { metadata?: ChapaMetadata; meta?: ChapaMetadata }).meta ||
      {}
    )
  }
  return {}
}

const runVerification = async (tx_ref: string) => {
  /* ---------------- CHECK TRANSACTION ---------------- */
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('tx_ref', tx_ref)
    .single()

  if (txError || !tx) {
    return { error: 'Transaction not found' }
  }

  // 🔥 Prevent duplicate processing
  if (tx.status === 'success') {
    return { status: 'already_processed', orderId: tx.order_id }
  }

  /* ---------------- VERIFY WITH CHAPA ---------------- */
  const verify = await axios.get(
    `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    },
  )

  const chapaData = verify.data.data

  if (!chapaData || chapaData.status !== 'success') {
    await supabase
      .from('transactions')
      .update({ status: 'failed' })
      .eq('tx_ref', tx_ref)

    return { error: 'Payment not successful' }
  }

  /* ---------------- AMOUNT VALIDATION ---------------- */
  const paidAmount = Number(chapaData.amount)

  if (paidAmount !== Number(tx.amount)) {
    console.error('⚠️ Amount mismatch:', paidAmount, tx.amount)

    await supabase
      .from('transactions')
      .update({ status: 'mismatch' })
      .eq('tx_ref', tx_ref)

    return { error: 'Amount mismatch' }
  }

  const userId = tx.user_id
  const userEmail = tx.email

  /* ---------------- FETCH CART ---------------- */
  const { data: carts } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'pending')

  if (!carts?.length) {
    return { status: 'skipped', message: 'No cart found' }
  }

  const cartIds = carts.map((c) => c.id)

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, product:product_id(*)')
    .in('cart_id', cartIds)

  if (!cartItems?.length) {
    return { status: 'skipped', message: 'No items' }
  }

  const items = cartItems as CartItemWithProduct[]

  /* ---------------- CREATE ORDER ---------------- */
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      email: userEmail,
      total,
      status: 'paid',
      tx_ref,
    })
    .select()
    .single()

  if (orderError || !order) {
    return { error: 'Order creation failed' }
  }

  /* ---------------- ORDER ITEMS ---------------- */
  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product.id,
    vendor_id: i.product.vendor_id,
    quantity: i.quantity,
    price: i.product.price,
  }))

  await supabase.from('order_items').insert(orderItems)

  /* ---------------- CLEAN CART ---------------- */
  await supabase.from('cart_items').delete().in('cart_id', cartIds)

  await supabase.from('carts').update({ status: 'completed' }).in('id', cartIds)

  /* ---------------- UPDATE TRANSACTION ---------------- */
  await supabase
    .from('transactions')
    .update({
      status: 'success',
      order_id: order.id,
    })
    .eq('tx_ref', tx_ref)

  return { status: 'success', orderId: order.id }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tx_ref = searchParams.get('tx_ref')

  if (!tx_ref) {
    return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 })
  }

  try {
    const result = await runVerification(tx_ref)
    if ('error' in result) {
      return NextResponse.json(result, { status: 500 })
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Verification error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tx_ref = body?.tx_ref || new URL(req.url).searchParams.get('tx_ref')

    if (!tx_ref) {
      return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 })
    }

    const result = await runVerification(tx_ref)
    if ('error' in result) {
      return NextResponse.json(result, { status: 500 })
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Verification error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
