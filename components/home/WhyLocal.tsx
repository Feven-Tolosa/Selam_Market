'use client'

import { Store, Truck, ShieldCheck, Users, Star, Clock } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WhyLocal() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [statsData, setStatsData] = useState({
    vendors: 245,
    customers: 12500,
    rating: 4.8,
    products: 3420
  })
  const [loading, setLoading] = useState(true)

  const features = [
    {
      icon: Store,
      title: 'Support Local',
      description: 'Empower small businesses in your community',
      short: 'Boost local economy',
      delay: 0,
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Get your orders in hours, not days',
      short: 'Same-day shipping',
      delay: 100,
    },
    {
      icon: ShieldCheck,
      title: '100% Secure',
      description: 'Verified vendors & safe transactions',
      short: 'Shop with confidence',
      delay: 200,
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Join thousands of happy customers',
      short: 'Growing together',
      delay: 300,
    },
  ]

  // Fetch real data from database
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        
        // Fetch total vendors count
        const { count: vendorsCount, error: vendorsError } = await supabase
          .from('vendors')
          .select('*', { count: 'exact', head: true })
        
        if (vendorsError) {
          console.error('Vendors count error:', vendorsError)
        } else if (vendorsCount !== null) {
          setStatsData(prev => ({ ...prev, vendors: vendorsCount }))
        }
        
        // Fetch total products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
        
        if (productsError) {
          console.error('Products count error:', productsError)
        } else if (productsCount !== null) {
          setStatsData(prev => ({ ...prev, products: productsCount }))
        }
        
        // Fetch average rating from vendor_ratings
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('vendor_ratings')
          .select('rating')
        
        if (!ratingsError && ratingsData && ratingsData.length > 0) {
          const totalRating = ratingsData.reduce((sum, item) => sum + item.rating, 0)
          const avgRating = totalRating / ratingsData.length
          setStatsData(prev => ({ ...prev, rating: parseFloat(avgRating.toFixed(1)) }))
        }
        
        // Fetch unique customers (users with orders)
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('user_id')
        
        if (!ordersError && ordersData && ordersData.length > 0) {
          const uniqueUserIds = new Set(ordersData.map(order => order.user_id))
          setStatsData(prev => ({ ...prev, customers: uniqueUserIds.size }))
        }
        
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Keep fallback data
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  // Intersection Observer to trigger animations when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Format numbers (e.g., 12500 -> 12.5k)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  const stats = [
    { 
      value: formatNumber(statsData.vendors), 
      label: 'Local Vendors', 
      icon: Store,
    },
    { 
      value: formatNumber(statsData.customers), 
      label: 'Happy Buyers', 
      icon: Users,
    },
    { 
      value: statsData.rating.toFixed(1), 
      label: 'Rating', 
      icon: Star,
    },
    { 
      value: formatNumber(statsData.products), 
      label: 'Products', 
      icon: Store,
    },
  ]

  return (
    <section ref={sectionRef} className='py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden'>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #1a2a3a 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#10b5cb]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#10b5cb]/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

      <div className='container mx-auto px-6 relative z-10'>
        {/* Animated Header */}
        <div 
          className={`text-center mb-12 transition-all duration-700 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-block mb-3">
            <span className="bg-[#10b5cb]/10 text-[#10b5cb] text-xs font-semibold px-3 py-1 rounded-full border border-[#10b5cb]/20">
              Why Choose Us
            </span>
          </div>
          
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
            Why Shop <span className='text-[#10b5cb]'>Local?</span>
          </h2>
          
          <p className='text-gray-500 mt-2 max-w-lg mx-auto text-sm'>
            Better for you, better for your community
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-5'>
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <div
                key={index}
                className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden ${
                  isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-16 opacity-0'
                }`}
                style={{
                  transitionDelay: `${feature.delay}ms`,
                  transitionProperty: 'all',
                  transitionDuration: '500ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className={`absolute inset-0 border border-[#10b5cb] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
                
                <div className='relative bg-white p-5 rounded-xl'>
                  <div className='w-12 h-12 flex items-center justify-center rounded-lg bg-[#10b5cb]/10 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'>
                    <Icon className='w-6 h-6 text-[#10b5cb]' />
                  </div>

                  <h3 className='font-bold text-lg mb-1 text-gray-800 group-hover:text-[#10b5cb] transition-colors duration-300'>
                    {feature.title}
                  </h3>

                  <p className='text-gray-500 text-sm leading-relaxed'>
                    {feature.description}
                  </p>

                  <div className="mt-2">
                    <span className="text-xs text-[#10b5cb]/70 font-medium">
                      {feature.short}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div 
          className={`mt-12 pt-8 border-t border-gray-200 transition-all duration-700 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {stats.map((stat, index) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={index}
                  className='text-center group cursor-pointer hover:scale-105 transition-all duration-300'
                >
                  <div className='w-12 h-12 mx-auto mb-2 rounded-full bg-[#10b5cb]/10 flex items-center justify-center group-hover:bg-[#10b5cb]/20 transition-all duration-300'>
                    <StatIcon className='w-6 h-6 text-[#10b5cb]' />
                  </div>
                  <div className='text-2xl md:text-3xl font-bold text-gray-800 mb-0.5 group-hover:text-[#10b5cb] transition-colors duration-300'>
                    {stat.value}
                  </div>
                  <div className='text-xs text-gray-500'>{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Banner */}
        
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
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