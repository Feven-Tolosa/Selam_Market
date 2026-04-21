'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
}

type DealProduct = Product & {
  discount: number
}

export default function TopDeals() {
  const [deals, setDeals] = useState<DealProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  // Cycle through products for spotlight effect
  useEffect(() => {
    if (deals.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % deals.length)
      }, 2000) // Change spotlight every 2 seconds
      return () => clearInterval(interval)
    }
  }, [deals.length])

  function generateDiscount() {
    return Math.floor(Math.random() * 26) + 5 // 5% → 30%
  }

  async function fetchDeals() {
    setLoading(true)

    const { data, error } = await supabase.from('products').select('*').limit(8)

    if (!error && data) {
      const withDiscounts = data.map((product) => ({
        ...product,
        discount: generateDiscount(),
      }))

      // sort highest discount first
      const sorted = withDiscounts.sort((a, b) => b.discount - a.discount)

      setDeals(sorted.slice(0, 4))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  return (
    <section className='py-20 bg-gray-50'>
      <div className='container mx-auto px-6'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-[#10b5cb]'>Top Deals</h2>
          <p className='text-gray-600 mt-3 max-w-xl mx-auto'>
            Discover great prices from local vendors near you.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className='text-center text-gray-500'>Loading deals...</div>
        ) : (
          <div className='grid sm:grid-cols-2 md:grid-cols-4 gap-8'>
            {deals.map((deal, index) => {
              const discountedPrice =
                deal.price - (deal.price * deal.discount) / 100

              const isActive = index === activeIndex
              const isPrevActive =
                index === (activeIndex - 1 + deals.length) % deals.length
              const isNextActive = index === (activeIndex + 1) % deals.length

              return (
                <Link
                  key={index}
                  href={`/products/${deal.id}`}
                  className={`relative group rounded-xl overflow-hidden transition-all duration-700 transform
                    ${isActive ? 'scale-105 z-20' : isPrevActive || isNextActive ? 'scale-95 opacity-70' : 'opacity-40 scale-90'}
                  `}
                >
                  {/* Dim light overlay - darkens inactive cards */}
                  <div
                    className={`absolute inset-0 transition-all duration-700 ${
                      isActive
                        ? 'bg-gray-50/0'
                        : 'bg-gray-50/80 backdrop-blur-sm'
                    } z-10`}
                  ></div>

                  {/* Spotlight effect on active card */}
                  {isActive && (
                    <>
                      <div className='absolute inset-0 bg-gradient-to-t from-[#10b5cb]/10 via-transparent to-transparent z-10'></div>
                      <div className='absolute -inset-1 bg-gradient-to-r from-[#10b5cb]/20 via-transparent to-[#10b5cb]/20 blur-xl animate-spotlight z-0'></div>
                    </>
                  )}

                  {/* Card content */}
                  <div
                    className={`relative bg-white p-6 transition-all duration-500 ${
                      isActive
                        ? 'border-2 border-[#10b5cb] shadow-xl'
                        : 'border border-gray-200'
                    }`}
                  >
                    {/* Discount badge with glow */}
                    <div
                      className={`absolute top-3 left-3 text-white text-xs px-2 py-1 rounded-full z-20 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50 animate-pulse'
                          : 'bg-red-500'
                      }`}
                    >
                      -{deal.discount}%
                    </div>

                    {/* Pulse ring for active card */}
                    {isActive && (
                      <div className='absolute inset-0 rounded-xl border-2 border-[#10b5cb] animate-ping opacity-30'></div>
                    )}

                    {/* Image with glow effect on active */}
                    <div className='flex justify-center mb-4 relative'>
                      <div
                        className={`absolute inset-0 bg-[#10b5cb] rounded-full blur-xl transition-opacity duration-500 ${
                          isActive ? 'opacity-30' : 'opacity-0'
                        }`}
                      ></div>
                      <Image
                        src={deal.image_url || '/placeholder.png'}
                        width={90}
                        height={90}
                        alt={deal.name}
                        className={`group-hover:scale-110 transition-all duration-500 relative z-10 ${
                          isActive
                            ? 'drop-shadow-[0_0_15px_rgba(16,181,203,0.3)]'
                            : ''
                        }`}
                      />
                    </div>

                    <div className='flex flex-col items-center'>
                      {/* Name */}
                      <h3
                        className={`font-semibold text-center mb-2 transition-colors duration-300 ${
                          isActive ? 'text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {deal.name}
                      </h3>

                      {/* Price */}
                      <p className='text-center mb-1'>
                        <span className='line-through mr-2 text-sm text-gray-400'>
                          ${deal.price}
                        </span>
                        <span
                          className={`font-bold transition-colors duration-300 ${
                            isActive
                              ? 'text-[#10b5cb] text-lg'
                              : 'text-[#10b5cb]'
                          }`}
                        >
                          ${discountedPrice.toFixed(2)}
                        </span>
                      </p>

                      <p
                        className={`text-center text-sm transition-colors duration-300 ${
                          isActive
                            ? 'text-green-600 font-medium'
                            : 'text-green-500'
                        }`}
                      >
                        Save {deal.discount}%
                      </p>

                      {/* Indicator dots for active card */}
                      {isActive && (
                        <div className='mt-3 flex gap-1'>
                          <div className='w-1.5 h-1.5 bg-[#10b5cb] rounded-full animate-bounce'></div>
                          <div className='w-1.5 h-1.5 bg-[#10b5cb] rounded-full animate-bounce animation-delay-200'></div>
                          <div className='w-1.5 h-1.5 bg-[#10b5cb] rounded-full animate-bounce animation-delay-400'></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Neon border that scans across active card */}
                  {isActive && (
                    <div className='absolute inset-0 pointer-events-none overflow-hidden rounded-xl'>
                      <div className='absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#10b5cb] to-transparent animate-scan-x'></div>
                      <div className='absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#10b5cb] to-transparent animate-scan-x-reverse'></div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Spotlight indicator dots */}
        {!loading && deals.length > 0 && (
          <div className='flex justify-center gap-2 mt-12'>
            {deals.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex
                    ? 'w-8 h-2 bg-[#10b5cb] shadow-lg shadow-[#10b5cb]/50'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes spotlight {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        @keyframes scan-x {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes scan-x-reverse {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-spotlight {
          animation: spotlight 2s ease-in-out infinite;
        }

        .animate-scan-x {
          animation: scan-x 2s linear infinite;
        }

        .animate-scan-x-reverse {
          animation: scan-x-reverse 2s linear infinite;
        }

        .animate-bounce {
          animation: bounce 0.6s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </section>
  )
}
