export default function PaymentFailedPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen text-center space-y-4'>
      <h1 className='text-3xl font-bold text-red-600'>Payment Failed ❌</h1>
      <p className='text-gray-600'>Something went wrong. Please try again.</p>

      <a
        href='/cart'
        className='mt-4 px-6 py-2 bg-[#10b5cb] text-white rounded hover:bg-[#0da0b5]'
      >
        Back to Cart
      </a>
    </div>
  )
}
