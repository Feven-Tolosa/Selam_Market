import React from 'react'

export default function Newsletter() {
  return (
    <div className='bg-[#10b5cb]/10 py-12'>
      <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6'>
        <div>
          <h2 className='text-xl font-semibold text-gray-800'>
            Subscribe to our newsletter
          </h2>
          <p className='text-gray-600 text-sm'>
            Get updates about new products and vendors.
          </p>
        </div>

        <div className='flex w-full md:w-auto'>
          <input
            placeholder='Enter your email'
            className='border rounded-l-md px-4 py-2 w-full md:w-64'
          />

          <button className='bg-[#10b5cb] text-white px-6 rounded-r-md hover:bg-[#0e9fb3]'>
            Subscribe
          </button>
        </div>
      </div>
    </div>
  )
}
