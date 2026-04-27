'use client'

export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
}

type Vendor = {
  id: string
  business_name: string
  store_name: string
}

// 🔥 Raw type from Supabase
type RawVendor = {
  id: string
  business_name: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const search = async () => {
      if (!query) return

      setLoading(true)

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()

        setProducts(data.products || [])

        const formattedVendors: Vendor[] = (data.vendors || []).map(
          (v: RawVendor) => ({
            id: v.id,
            business_name: v.business_name,
            store_name: v.business_name,
          }),
        )

        setVendors(formattedVendors)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query])

  return (
    <div className='max-w-7xl mx-auto px-4 py-6'>
      <h1 className='text-2xl font-semibold mb-6'>
        Search results for: {query}
      </h1>

      {loading && <p>Searching...</p>}

      {/* PRODUCTS */}
      <div className='mb-10'>
        <h2 className='text-xl font-semibold mb-4'>Products</h2>

        {products.length === 0 ? (
          <p className='text-gray-500'>No products found</p>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className='border rounded-lg p-3 hover:shadow'
              >
                <Image
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  width={200}
                  height={200}
                  className='w-full h-40 object-cover rounded'
                />
                <h3 className='mt-2 font-medium'>{product.name}</h3>
                <p className='text-[#10b5cb] font-semibold'>${product.price}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* VENDORS */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Vendors</h2>

        {vendors.length === 0 ? (
          <p className='text-gray-500'>No vendors found</p>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendor/${vendor.id}`}
                className='border rounded-lg p-4 hover:shadow flex items-center justify-center'
              >
                <p className='font-medium text-center'>{vendor.store_name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
