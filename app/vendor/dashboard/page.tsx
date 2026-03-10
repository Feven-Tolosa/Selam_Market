import Link from 'next/link'

export default function VendorDashboard() {
  return (
    <div className='max-w-6xl mx-auto py-16'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-semibold'>Vendor Dashboard</h1>

        <Link
          href='/vendor/products/new'
          className='bg-[#10b5cb] text-white px-5 py-2 rounded'
        >
          Add Product
        </Link>
      </div>

      <div className='border rounded-lg p-10 text-center text-gray-500'>
        Your products will appear here.
      </div>
    </div>
  )
}
