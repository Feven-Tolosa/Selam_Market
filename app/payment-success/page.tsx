'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tx_ref = searchParams.get('tx_ref')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!tx_ref) return

    const verifyPayment = async () => {
      setVerifying(true)
      try {
        const res = await fetch(
          `/api/verify?tx_ref=${encodeURIComponent(tx_ref)}`,
        )
        const data = await res.json()

        if (data.status === 'success') {
          setVerified(true)
        } else {
          console.error('Verification failed:', data)
        }
      } catch (err) {
        console.error('Verification error:', err)
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [tx_ref])

  return (
    <div className='flex flex-col items-center justify-center h-screen text-center space-y-4'>
      <h1 className='text-3xl font-bold text-green-600'>
        Payment Successful 🎉
      </h1>

      {verifying && <p className='text-gray-600'>Verifying payment...</p>}

      {!verifying && verified && (
        <p className='text-gray-600'>
          Your order has been placed successfully.
        </p>
      )}

      {!verifying && !verified && tx_ref && (
        <p className='text-gray-600'>Payment verification in progress...</p>
      )}

      <div className='space-y-2'>
        <Link
          href='/products'
          className='block px-6 py-2 bg-[#10b5cb] text-white rounded hover:bg-[#0da0b5]'
        >
          Continue Shopping
        </Link>

        <Link
          href='/cart'
          className='block px-6 py-2 border border-[#10b5cb] text-[#10b5cb] rounded hover:bg-[#10b5cb] hover:text-white'
        >
          View Cart
        </Link>
      </div>
    </div>
  )
}
