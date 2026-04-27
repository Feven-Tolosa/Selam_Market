import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-center space-y-4'>
      <h1 className='text-3xl font-bold text-green-600'>
        Payment Successful 🎉
      </h1>
      <p className='text-gray-600'>Your order has been placed successfully.</p>

      <Link
        href='/products'
        className='mt-4 px-6 py-2 bg-[#10b5cb] text-white rounded hover:bg-[#0da0b5]'
      >
        Continue Shopping
      </Link>
    </div>
  )
}
