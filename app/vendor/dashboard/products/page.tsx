import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default async function VendorProducts() {
  const { data: products } = await supabase.from('products').select('*')

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>My Products</h1>

        <Link
          href='/vendor/products/new'
          className='bg-[#10b5cb] text-white px-5 py-2 rounded'
        >
          Add Product
        </Link>
      </div>

      <div className='bg-white border rounded-lg overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b'>
            <tr className='text-left text-sm text-gray-600'>
              <th className='p-4'>Product</th>
              <th className='p-4'>Price</th>
              <th className='p-4'>Created</th>
              <th className='p-4'>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className='border-t'>
                <td className='p-4 flex items-center gap-3'>
                  <img
                    src={product.image_url || '/selam(2).jpeg'}
                    className='w-12 h-12 object-cover rounded'
                  />

                  {product.name}
                </td>

                <td className='p-4'>${product.price}</td>

                <td className='p-4 text-gray-500'>
                  {new Date(product.created_at).toLocaleDateString()}
                </td>

                <td className='p-4 space-x-3'>
                  <Link
                    href={`/vendor/products/edit/${product.id}`}
                    className='text-blue-500'
                  >
                    Edit
                  </Link>

                  <button className='text-red-500'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
