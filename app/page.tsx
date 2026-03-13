import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import Newsletter from '@/components/home/Newsletter'
import PopularVendors from '@/components/home/PopularVendors'
import TopDeals from '@/components/home/TopDeals'
import WhyLocal from '@/components/home/WhyLocal'

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <WhyLocal />
      <PopularVendors />
      <HowItWorks />
      <TopDeals />
      <Newsletter />
    </>
  )
}
