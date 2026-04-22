'use client'

import {
  Store,
  Truck,
  ShieldCheck,
  Users,
  TrendingUp,
  Award,
  Clock,
  Heart,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

export default function WhyLocal() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const features = [
    {
      icon: Store,
      title: 'Support Local Vendors',
      description: 'Buy directly from trusted vendors in your community.',
      delay: 0,
    },
    {
      icon: Truck,
      title: 'Fast Local Delivery',
      description: 'Get your products faster with local delivery options.',
      delay: 100,
    },
    {
      icon: ShieldCheck,
      title: 'Secure Transactions',
      description: 'All vendors are verified to ensure safe transactions.',
      delay: 200,
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Help grow small businesses and local entrepreneurs.',
      delay: 300,
    },
  ]

  const stats = []

  // Intersection Observer to trigger animations when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className='py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden'
    >
      {/* Animated Background with website colors */}
      <div
        className='absolute inset-0 opacity-5'
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1a2a3a 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className='absolute top-20 left-10 w-72 h-72 bg-[#10b5cb]/5 rounded-full blur-3xl animate-pulse-slow'></div>
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-[#10b5cb]/5 rounded-full blur-3xl animate-pulse-slow delay-1000'></div>

      <div className='container mx-auto px-6 relative z-10'>
        {/* Animated Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className='inline-block mb-4'>
            <span className='bg-[#10b5cb]/10 text-[#10b5cb] text-sm font-semibold px-5 py-2 rounded-full border border-[#10b5cb]/20 animate-pulse-slow'>
              Why Choose Us
            </span>
          </div>

          <h2 className='text-3xl font-bold'>Why Shop Local?</h2>
          <p className='text-muted-foreground mt-3 max-w-xl mx-auto'>
            Discover the advantages of supporting local businesses and vendors
            in your area.
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-16 opacity-0'
                }`}
                style={{
                  transitionDelay: `${feature.delay}ms`,
                  transitionProperty: 'all',
                  transitionDuration: '600ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Border on hover - using website color only */}
                <div
                  className={`absolute inset-0 border-2 border-[#10b5cb] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
                ></div>

                <div className='relative bg-white p-6 rounded-2xl'>
                  {/* Icon with animation */}
                  <div className='w-16 h-16 flex items-center justify-center rounded-xl bg-[#10b5cb]/10 mb-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300'>
                    <Icon className='w-8 h-8 text-[#10b5cb]' />
                  </div>

                  <h3 className='font-bold text-xl mb-3 text-gray-800 group-hover:text-[#10b5cb] transition-colors duration-300'>
                    {feature.title}
                  </h3>

                  <p className='text-gray-500 leading-relaxed'>
                    {feature.description}
                  </p>

                  {/* Animated arrow on hover */}
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div
          className={`mt-20 pt-10 border-t border-gray-200 transition-all duration-700 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            {stats.map((stat, index) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={index}
                  className='text-center group cursor-pointer hover:scale-105 transition-transform duration-300'
                >
                  <div className='w-12 h-12 mx-auto mb-3 rounded-full bg-[#10b5cb]/10 flex items-center justify-center group-hover:bg-[#10b5cb]/20 transition-all duration-300 group-hover:rotate-12'>
                    <StatIcon className='w-6 h-6 text-[#10b5cb]' />
                  </div>
                  <div className='text-3xl md:text-4xl font-bold text-gray-800 mb-1 group-hover:text-[#10b5cb] transition-colors duration-300'>
                    {stat.value}
                  </div>
                  <div className='text-sm text-gray-500'>{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  )
}
