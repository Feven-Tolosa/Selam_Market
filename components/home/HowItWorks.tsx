// components/home/HowItWorks.tsx
import { ShoppingCart, Truck, Smile } from 'lucide-react'

const steps = [
  {
    icon: ShoppingCart,
    title: 'Choose Product',
    desc: 'Browse and select from hundreds of local products.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Receive your order quickly with local delivery options.',
  },
  {
    icon: Smile,
    title: 'Enjoy & Support',
    desc: 'Enjoy your purchase and support local businesses.',
  },
]

export default function HowItWorks() {
  return (
    <section className='py-20 bg-[#10b5cb10]'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold' style={{ color: '#10b5cb' }}>
            How It Works
          </h2>
          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            Follow these simple steps to shop from local vendors.
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className='bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition'
                style={{ borderColor: '#10b5cb30' }}
              >
                <div className='w-12 h-12 flex items-center justify-center rounded-lg bg-[#10b5cb20] mb-4'>
                  <Icon className='w-6 h-6 text-[#10b5cb]' />
                </div>
                <h3 className='font-semibold text-lg mb-2 text-center'>
                  {step.title}
                </h3>
                <p className='text-gray-700 text-center text-sm'>{step.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
