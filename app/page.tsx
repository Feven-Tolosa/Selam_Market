import CategoriesSection from '@/components/home/CategoriesSection'
import Featured from '@/components/home/Featuered'
import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import Newsletter from '@/components/home/Newsletter'
import TopDeals from '@/components/home/TopDeals'
import TopVendors from '@/components/home/TopVendors'
import WhyLocal from '@/components/home/WhyLocal'
import Footer from '@/components/layout/Footer'
import AvailableProducts from '@/components/home/AvailableProducts'

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <Featured />
      <HowItWorks />
      <AvailableProducts />
      <WhyLocal />
      <TopVendors />
      <TopDeals />
      <Newsletter />
      <Footer />
    </>
  )
}
