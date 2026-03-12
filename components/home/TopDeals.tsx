// components/home/TopDeals.tsx
import Image from 'next/image'

const deals = [
  {
    name: 'Fresh Apples',
    price: '$5',
    discount: '20%',
    img: '/products/apple.png',
  },
  {
    name: 'Handmade Basket',
    price: '$12',
    discount: '15%',
    img: '/products/basket.png',
  },
  {
    name: 'Organic Milk',
    price: '$8',
    discount: '10%',
    img: '/products/milk.png',
  },
  {
    name: 'Local Bread',
    price: '$3',
    discount: '25%',
    img: '/products/bread.png',
  },
]

export default function TopDeals() {
  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold' style={{ color: '#10b5cb' }}>
            Top Deals
          </h2>
          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            Check out the best discounts from local vendors.
          </p>
        </div>

        <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-8'>
          {deals.map((deal, index) => (
            <div
              key={index}
              className='bg-white p-6 rounded-xl border hover:shadow-lg transition'
              style={{ borderColor: '#10b5cb30' }}
            >
              <div className='flex justify-center mb-4'>
                <Image src={deal.img} width={80} height={80} alt={deal.name} />
              </div>
              <h3 className='font-semibold text-center mb-2'>{deal.name}</h3>
              <p className='text-center text-gray-700 mb-1'>
                <span className='line-through mr-2'>
                  $ {parseInt(deal.price) + 2}
                </span>
                <span className='font-bold' style={{ color: '#10b5cb' }}>
                  {deal.price}
                </span>
              </p>
              <p className='text-center text-sm text-primary/70'>
                {deal.discount} off
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
