import Image from 'next/image'
import { Star } from 'lucide-react'

const vendors = [
  {
    name: 'FreshMart',
    logo: '/vendors/freshmart.png',
    rating: 4.8,
    products: 124,
  },
  {
    name: 'Handy Crafts',
    logo: '/vendors/handycrafts.png',
    rating: 4.6,
    products: 98,
  },
  {
    name: 'Local Bakery',
    logo: '/vendors/localbakery.png',
    rating: 4.9,
    products: 75,
  },
  {
    name: 'Organic Farm',
    logo: '/vendors/organicfarm.png',
    rating: 4.7,
    products: 112,
  },
]

export default function PopularVendors() {
  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-6'>
        {/* Section Title */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold' style={{ color: '#10b5cb' }}>
            Popular Vendors
          </h2>

          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            Discover trusted local vendors and explore their products.
          </p>
        </div>

        {/* Vendor Cards */}
        <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-8'>
          {vendors.map((vendor, index) => (
            <div
              key={index}
              className='bg-white p-6 rounded-xl border transition hover:shadow-lg'
              style={{ borderColor: '#10b5cb30' }}
            >
              {/* Vendor Logo */}
              <div className='flex items-center justify-center mb-4'>
                <div
                  className='w-16 h-16 flex items-center justify-center rounded-full'
                  style={{ backgroundColor: '#10b5cb10' }}
                >
                  <Image
                    src={vendor.logo}
                    alt={vendor.name}
                    width={40}
                    height={40}
                    className='object-cover'
                  />
                </div>
              </div>

              {/* Vendor Name */}
              <h3 className='font-semibold text-lg text-center mb-1'>
                {vendor.name}
              </h3>

              {/* Rating */}
              <div className='flex items-center justify-center mb-2'>
                <Star className='w-4 h-4 mr-1' style={{ color: '#10b5cb' }} />
                <span className='text-sm text-gray-700'>
                  {vendor.rating} • {vendor.products} products
                </span>
              </div>

              {/* Link */}
              <a
                href='#'
                className='block text-center mt-3 font-medium transition'
                style={{ color: '#10b5cb' }}
              >
                View Profile →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
