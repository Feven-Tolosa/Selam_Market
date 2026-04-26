'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()

  const tx_ref = searchParams.get('tx_ref')
  const status = searchParams.get('status')

  useEffect(() => {
    // Optional: you can trigger verification here if needed
    console.log('Subscription success:', { tx_ref, status })
  }, [tx_ref, status])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='bg-white shadow-md rounded-xl p-8 max-w-md w-full text-center'>
        {/* ✅ Icon */}
        <div className='w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100'>
          <span className='text-2xl'>✅</span>
        </div>

        {/* ✅ Title */}
        <h1 className='text-2xl font-bold mb-2'>Subscription Activated</h1>

        {/* ✅ Description */}
        <p className='text-gray-600 mb-6'>
          Your vendor subscription was successful. You now have full access to
          the platform.
        </p>

        {/* ✅ Optional info */}
        {tx_ref && (
          <p className='text-xs text-gray-400 mb-4'>Transaction: {tx_ref}</p>
        )}

        {/* ✅ Actions */}
        <div className='flex flex-col gap-3'>
          <Link
            href='/vendor/dashboard'
            className='bg-[#10b5cb] text-white py-2 rounded-lg hover:opacity-90'
          >
            Go to Dashboard
          </Link>

          <Link
            href='/vendor/dashboard/subscription'
            className='text-sm text-gray-500 hover:underline'
          >
            View Subscription Details
          </Link>
        </div>
      </div>
    </div>
  )
}
