import { supabase } from '@/lib/supabaseClient'

export default async function VendorDashboard() {
  const { data: products } = await supabase.from('products').select('*')

  const totalProducts = products?.length || 0

  return (
    <div>
      <h1 className='text-2xl font-semibold mb-8'>Dashboard Overview</h1>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-6'>
        <div className='bg-white border rounded-lg p-6'>
          <p className='text-gray-500 text-sm'>Total Products</p>
          <p className='text-2xl font-bold text-[#10b5cb]'>{totalProducts}</p>
        </div>

        <div className='bg-white border rounded-lg p-6'>
          <p className='text-gray-500 text-sm'>Orders</p>
          <p className='text-2xl font-bold text-[#10b5cb]'>0</p>
        </div>

        <div className='bg-white border rounded-lg p-6'>
          <p className='text-gray-500 text-sm'>Revenue</p>
          <p className='text-2xl font-bold text-[#10b5cb]'>$0</p>
        </div>
      </div>
    </div>
  )
}
