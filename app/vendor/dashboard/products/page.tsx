'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  created_at: string
}

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // FETCH ONLY VENDOR PRODUCTS
  const fetchProducts = async () => {
    setLoading(true)

    // 1. Get logged-in user
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setLoading(false)
      return
    }

    // 2. Get vendor record
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (vendorError || !vendor) {
      console.error('Vendor not found')
      setLoading(false)
      return
    }

    // 3. Fetch ONLY this vendor's products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendor.id) // ✅ FIX: filter by vendor_id
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProducts(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // -------------------------
  // DELETE PRODUCT
  // -------------------------

  const deleteProduct = async (id: string) => {
    const confirmDelete = confirm('Delete this product?')
    if (!confirmDelete) return

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      alert('Delete failed')
      return
    }

    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className='p-6'>
      {/* HEADER */}
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>My Products</h1>
          <p className='text-gray-500 text-sm'>Manage your store products</p>
        </div>

        <Link
          href='/vendor/dashboard/products/new'
          className='bg-[#10b5cb] hover:bg-[#0ea5b7] text-white px-5 py-2 rounded-lg'
        >
          + Add Product
        </Link>
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* EMPTY */}
      {!loading && products.length === 0 && (
        <div className='text-center py-16 bg-white border rounded-lg'>
          <p className='text-gray-500 mb-4'>No products yet</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && products.length > 0 && (
        <div className='bg-white border rounded-xl overflow-hidden shadow-sm'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
              <tr className='text-left text-sm text-gray-600'>
                <th className='p-4'>Product</th>
                <th className='p-4'>Price</th>
                <th className='p-4'>Created</th>
                <th className='p-4 text-right'>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className='border-t hover:bg-gray-50'>
                  <td className='p-4 flex items-center gap-4'>
                    <img
                      src={
                        product.image_url || 'https://via.placeholder.com/100'
                      }
                      className='w-14 h-14 rounded-lg object-cover border'
                    />

                    <div>
                      <p className='font-medium'>{product.name}</p>
                      <p className='text-xs text-gray-500'>ID: {product.id}</p>
                    </div>
                  </td>

                  <td className='p-4'>${product.price}</td>

                  <td className='p-4 text-gray-500'>
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>

                  <td className='p-4 text-right space-x-4'>
                    <Link
                      href={`/vendor/dashboard/products/edit/${product.id}`}
                      className='text-blue-500 hover:underline'
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className='text-red-500 hover:underline'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
