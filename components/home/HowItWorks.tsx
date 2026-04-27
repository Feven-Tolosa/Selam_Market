'use client'

import { ShoppingCart, Truck, Smile } from 'lucide-react'
import { getTranslation } from '@/lib/i18n'

export default function HowItWorks() {
  const t = getTranslation()

  const steps = [
    {
      icon: ShoppingCart,
      title: t.howItWorks.step1.title,
      desc: t.howItWorks.step1.desc,
      animation: 'animate-bounce',
    },
    {
      icon: Truck,
      title: t.howItWorks.step2.title,
      desc: t.howItWorks.step2.desc,
      animation: 'animate-wiggle',
    },
    {
      icon: Smile,
      title: t.howItWorks.step3.title,
      desc: t.howItWorks.step3.desc,
      animation: 'animate-float',
    },
  ]

  return (
    <section className='py-20 bg-[#10b5cb10]'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold' style={{ color: '#10b5cb' }}>
            {t.howItWorks.title}
          </h2>

          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <div
                key={index}
                className='bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group'
                style={{ borderColor: '#10b5cb30' }}
              >
                <div className='w-12 h-12 flex items-center justify-center rounded-lg bg-[#10b5cb20] mb-4 overflow-hidden'>
                  <Icon
                    className={`w-6 h-6 text-[#10b5cb] ${step.animation}`}
                  />
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
