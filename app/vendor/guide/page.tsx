'use client'

import Link from 'next/link'
import { ChevronRight, Shield, Users, TrendingUp, Package, Clock, CreditCard, HelpCircle, ArrowLeft, LogIn, CheckCircle, AlertCircle } from 'lucide-react'

export default function VendorGuide() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1a2a3a] to-[#2a3a4a] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-[#10b5cb] hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Vendor Guide
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Your complete guide to becoming a successful vendor on LocalMarket. 
            Learn how to register, get approved, and start selling.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Vendors', value: '2,500+', icon: Users },
            { label: 'Monthly Orders', value: '50K+', icon: Package },
            { label: 'Avg. Approval Time', value: '24-48 hrs', icon: Clock },
            { label: 'Success Rate', value: '98%', icon: TrendingUp },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              <stat.icon className="text-[#10b5cb] mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="sticky top-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Guide Sections</h3>
              <ul className="space-y-2 text-sm">
                {[
                  'Vendor Registration Process',
                  'Login & Account Access',
                  'Admin Approval Process',
                  'Setting Up Your Store',
                  'Product Listings',
                  'Pricing Strategy',
                  'Order Management',
                  'Shipping & Delivery',
                  'Customer Service',
                  'Marketing Tips',
                  'Payment & Payouts',
                  'FAQs',
                ].map((section, idx) => (
                  <li key={idx}>
                    <a
                      href={`#section-${idx}`}
                      className="text-gray-600 hover:text-[#10b5cb] transition-colors flex items-center group"
                    >
                      <ChevronRight size={14} className="mr-2 group-hover:translate-x-1 transition-transform" />
                      {section}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 space-y-12">
            {/* Section 0: Vendor Registration Process */}
            <section id="section-0" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Shield className="text-[#10b5cb] mr-3" size={28} />
                Vendor Registration Process
              </h2>
              <div className="prose max-w-none text-gray-600">
                <p className="mb-4">
                  Welcome to LocalMarket! Follow these steps to become an approved vendor:
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#10b5cb] text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Complete Registration Form</h3>
                      <p className="text-gray-600">Click "Become a Vendor" and fill out the registration form with your business details.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#10b5cb] text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Submit Required Documents</h3>
                      <p className="text-gray-600">Upload your business license, tax ID, and identification documents.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#10b5cb] text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Create Your Account</h3>
                      <p className="text-gray-600">Set up your login credentials (email and password).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Wait for Admin Approval</h3>
                      <p className="text-gray-600">Our team will review your application within 24-48 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Start Selling!</h3>
                      <p className="text-gray-600">Once approved, log in to your vendor dashboard and start listing products.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 1: Login & Account Access */}
            <section id="section-1" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <LogIn className="text-[#10b5cb] mr-3" size={28} />
                Login & Account Access
              </h2>
              <div className="space-y-4 text-gray-600">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-800 flex items-start">
                    <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong>Important:</strong> You must log in to access your vendor dashboard. However, you can only start selling after admin approval.</span>
                  </p>
                </div>
                
                <h3 className="font-semibold text-gray-800 mt-4">How to Login:</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Go to the <Link href="/login" className="text-[#10b5cb] hover:underline">Login Page</Link></li>
                  <li>Enter your registered email and password</li>
                  <li>Click "Sign In"</li>
                  <li>You will be redirected to your vendor dashboard (if approved)</li>
                </ol>

                <div className="bg-blue-50 border-l-4 border-[#10b5cb] p-4 mt-4">
                  <p className="text-sm text-gray-700">
                    <strong>Pro Tip:</strong> Bookmark your vendor dashboard link for quick access. Always log out when using shared devices.
                  </p>
                </div>

                <div className="mt-4">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center px-6 py-3 bg-[#10b5cb] text-white rounded-lg hover:bg-[#0e9db0] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    Go to Login Page
                    <ChevronRight size={18} className="ml-2" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Section 2: Admin Approval Process */}
            <section id="section-2" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="text-[#10b5cb] mr-3" size={28} />
                Admin Approval Process
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  After registration, your account goes through a verification process. Here's what happens:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="border rounded-lg p-4">
                    <div className="font-semibold text-gray-800 mb-2">⏳ Pending Status</div>
                    <p className="text-sm text-gray-600">Your account is under review. You can log in but cannot list products or access vendor features.</p>
                  </div>
                  <div className="border rounded-lg p-4 border-green-200 bg-green-50">
                    <div className="font-semibold text-green-800 mb-2">✅ Approved Status</div>
                    <p className="text-sm text-green-700">Full vendor access granted! You can now list products, manage orders, and access all vendor tools.</p>
                  </div>
                  <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                    <div className="font-semibold text-red-800 mb-2">❌ Rejected Status</div>
                    <p className="text-sm text-red-700">Application rejected. Check your email for reasons and resubmit with corrected information.</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mt-4">What Admins Check:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Business license validity</li>
                  <li>Tax identification number</li>
                  <li>Product quality and authenticity</li>
                  <li>Business address verification</li>
                  <li>Background check (if applicable)</li>
                </ul>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                  <p className="text-sm text-gray-700">
                    <strong>Notification:</strong> You will receive an email notification once admin approves or rejects your application. You can also check your status by logging into your vendor dashboard.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Setting Up Your Store */}
            <section id="section-3" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Setting Up Your Store</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  After admin approval, set up your store to attract customers:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Store Name:</strong> Choose a memorable, descriptive name</li>
                  <li><strong>Logo & Banner:</strong> Upload professional images (recommended: 500x500px for logo, 1200x300px for banner)</li>
                  <li><strong>Store Description:</strong> Tell your story, highlight your values, and showcase what makes you unique</li>
                  <li><strong>Contact Information:</strong> Ensure phone and email are correct for customer inquiries</li>
                  <li><strong>Business Hours:</strong> Set your operating hours for customer expectations</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Product Listings */}
            <section id="section-4" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Listings</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Create compelling product listings that convert:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use high-quality images (minimum 5 photos per product)</li>
                  <li>Write detailed, SEO-friendly descriptions</li>
                  <li>Set competitive prices based on market research</li>
                  <li>Specify accurate stock quantities</li>
                  <li>Add product categories and tags for better discoverability</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Pricing Strategy */}
            <section id="section-5" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Pricing Strategy</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  LocalMarket charges a competitive commission fee. Consider these factors when pricing:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Product cost and materials</li>
                  <li>Labor and overhead expenses</li>
                  <li>Shipping and packaging costs</li>
                  <li>LocalMarket commission (varies by category)</li>
                  <li>Market demand and competitor pricing</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Order Management */}
            <section id="section-6" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Management</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Stay on top of orders from your vendor dashboard:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Receive instant notifications for new orders</li>
                  <li>Process orders within 24-48 hours</li>
                  <li>Update order status (confirmed, shipped, delivered)</li>
                  <li>Communicate with customers about delays</li>
                  <li>Handle returns and refunds professionally</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Shipping & Delivery */}
            <section id="section-7" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping & Delivery</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Set up your shipping options:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Define shipping zones and rates</li>
                  <li>Offer free shipping for orders above certain amount</li>
                  <li>Provide estimated delivery times</li>
                  <li>Use tracked shipping for customer peace of mind</li>
                  <li>Partner with reliable local couriers</li>
                </ul>
              </div>
            </section>

            {/* Section 8: Customer Service */}
            <section id="section-8" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Service</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Excellent customer service leads to repeat business:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Respond to customer inquiries within 24 hours</li>
                  <li>Address complaints promptly and professionally</li>
                  <li>Request reviews after successful deliveries</li>
                  <li>Maintain a high seller rating</li>
                  <li>Offer loyalty discounts for returning customers</li>
                </ul>
              </div>
            </section>

            {/* Section 9: Marketing Tips */}
            <section id="section-9" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Marketing Tips</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Grow your business with these marketing strategies:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Share your store link on social media</li>
                  <li>Run limited-time discounts and promotions</li>
                  <li>Offer bundle deals for higher value</li>
                  <li>Collect customer emails for newsletters</li>
                  <li>Participate in LocalMarket featured campaigns</li>
                </ul>
              </div>
            </section>

            {/* Section 10: Payment & Payouts */}
            <section id="section-10" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CreditCard className="text-[#10b5cb] mr-3" size={28} />
                Payment & Payouts
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Get paid for your sales:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payouts processed weekly (every Monday)</li>
                  <li>Multiple payout methods: Bank transfer, Mobile money, PayPal</li>
                  <li>Minimum payout threshold: 500 ETB</li>
                  <li>Track all transactions in your vendor dashboard</li>
                  <li>View detailed commission reports</li>
                </ul>
              </div>
            </section>

            {/* Section 11: FAQs */}
            <section id="section-11" className="bg-white rounded-lg shadow-md p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <HelpCircle className="text-[#10b5cb] mr-3" size={28} />
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "How long does admin approval take?",
                    a: "Typically 24-48 hours. You'll receive an email notification once approved."
                  },
                  {
                    q: "Can I log in before admin approval?",
                    a: "Yes, you can log in but vendor features will be locked until admin approves your account."
                  },
                  {
                    q: "What if my application is rejected?",
                    a: "You'll receive an email explaining why. You can update your information and resubmit."
                  },
                  {
                    q: "Is there a fee to become a vendor?",
                    a: "Registration is free. LocalMarket charges a commission on each sale."
                  },
                  {
                    q: "How do I contact admin for support?",
                    a: "Email vendor-support@localmarket.com or use the contact form in your dashboard."
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-3">
                    <h3 className="font-semibold text-gray-800 mb-1">{faq.q}</h3>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-[#1a2a3a] to-[#2a3a4a] rounded-lg p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-3">Ready to Start Your Vendor Journey?</h3>
              <p className="mb-6 text-gray-300">Register today and join our growing community of local vendors!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/vendor/onboarding"
                  className="px-6 py-3 bg-[#10b5cb] text-white rounded-lg hover:bg-[#0e9db0] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  Become a Vendor
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border border-[#10b5cb] text-[#10b5cb] rounded-lg hover:bg-[#10b5cb] hover:text-white transition-all duration-300"
                >
                  Login to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}