import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import Newsletter from '@/components/home/Newsletter'
import PopularVendors from '@/components/home/PopularVendors'
import TopDeals from '@/components/home/TopDeals'
import WhyLocal from '@/components/home/WhyLocal'
import Footer from '@/components/layout/Footer'

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts userId={''} />
      <WhyLocal />
      <PopularVendors />
      <HowItWorks />
      <TopDeals />
      <Newsletter />
      <Footer />
    </>
  )
}
