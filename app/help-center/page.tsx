'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import {
  Search,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  CreditCard,
  Store,
  ShieldCheck,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string
  answer: string
}

interface TopicCard {
  icon: React.ElementType
  title: string
  description: string
  href: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const topics: TopicCard[] = [
  {
    icon: ShoppingCart,
    title: 'Orders & Purchases',
    description: 'Track orders, manage purchases, and view order history.',
    href: '#orders',
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    description: 'Payment methods, invoices, and billing issues.',
    href: '#payments',
  },
  {
    icon: Store,
    title: 'Selling on Our system',
    description: 'Become a vendor, manage your store, and grow your business.',
    href: '#selling',
  },
  {
    icon: ShieldCheck,
    title: 'Account & Security',
    description: 'Password, profile settings, and account protection.',
    href: '#account',
  },
]

const faqs: FAQItem[] = [
  {
    question: 'How do I place an order on the system?',
    answer:
      'Browse products, add items to your cart, then proceed to checkout. You can pay using our supported payment methods. Once your order is confirmed, you will receive an email notification with your order details.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'After your order is shipped, you will receive a tracking number via email. You can also visit your account dashboard under "My Orders" to see real-time status updates for all your purchases.',
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We use chappa as a payment method. All transactions are secured with industry-standard encryption to keep your payment information safe.',
  },
  {
    question: 'How do I become a vendor on the system?',
    answer:
      'Click "Become a Vendor" on the homepage or navigate to /vendor/onboarding. Fill in your business details and submit for review. Our team will verify your information and approve your store within 1–3 business days.',
  },
  {
    question: 'What is the return policy?',
    answer:
      'Most items can be returned within 14 days of delivery if they are unused and in original packaging. Some categories like perishable goods are non-returnable. Initiate a return from your order history page.',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Go to the login page and click "Forgot Password". Enter your registered email address and we will send you a reset link. The link expires after 24 hours for security reasons.',
  },
  {
    question: 'Is my personal information secure?',
    answer:
      'Yes. We use end-to-end encryption and never share your personal data with third parties without your consent. You can review our full privacy policy for details on how we handle your information.',
  },
  {
    question: 'How do I contact a vendor directly?',
    answer:
      'On any product page, click the vendor name to visit their store profile. You will find a "Message Vendor" button there. You can also use our live chat feature to get connected quickly.',
  },
]

// ─── FAQ Accordion Item ────────────────────────────────────────────────────────

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className='border border-gray-200 rounded-xl overflow-hidden'>
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition'
        aria-expanded={open}
      >
        <span className='font-medium text-gray-800'>{item.question}</span>
        {open ? (
          <ChevronUp className='w-5 h-5 text-[#10b5cb] shrink-0 ml-4' />
        ) : (
          <ChevronDown className='w-5 h-5 text-gray-400 shrink-0 ml-4' />
        )}
      </button>

      {open && (
        <div className='px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4'>
          {item.answer}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* ── Hero ── */}
      <section className='bg-gradient-to-br from-[#10b5cb]/20 via-white to-[#10b5cb]/5 py-20'>
        <div className='max-w-3xl mx-auto px-6 text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10b5cb]/10 mb-6'>
            <HelpCircle className='w-8 h-8 text-[#10b5cb]' />
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900'>
            How can we <span className='text-[#10b5cb]'>help you?</span>
          </h1>
          <p className='mt-4 text-gray-500 text-lg'>
            Search our knowledge base or browse topics below.
          </p>

          {/* Search */}
          <div className='mt-8 relative max-w-xl mx-auto'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search for answers…'
              className='w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:border-[#10b5cb] focus:ring-2 focus:ring-[#10b5cb]/20 text-gray-800 transition'
            />
          </div>
        </div>
      </section>

      {/* ── Topic Cards ── */}
      {!searchQuery && (
        <section className='py-16 bg-white'>
          <div className='max-w-7xl mx-auto px-6'>
            <h2 className='text-2xl font-bold text-gray-800 mb-8 text-center'>
              Browse by Topic
            </h2>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {topics.map((topic) => {
                const Icon = topic.icon
                return (
                  <Link
                    key={topic.title}
                    href={topic.href}
                    className='group flex items-start gap-4 p-6 rounded-xl border border-gray-200 hover:border-[#10b5cb] hover:shadow-md transition'
                  >
                    <div className='w-12 h-12 flex items-center justify-center rounded-lg bg-[#10b5cb]/10 group-hover:bg-[#10b5cb]/20 transition shrink-0'>
                      <Icon className='w-6 h-6 text-[#10b5cb]' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-800 group-hover:text-[#10b5cb] transition'>
                        {topic.title}
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        {topic.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ Section ── */}
      <section className='py-16 bg-gray-50' id='faq'>
        <div className='max-w-3xl mx-auto px-6'>
          <div className='text-center mb-10'>
            <h2 className='text-2xl font-bold text-gray-800'>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : 'Frequently Asked Questions'}
            </h2>
            {!searchQuery && (
              <p className='text-gray-500 mt-2 text-sm'>
                Quick answers to the most common questions.
              </p>
            )}
          </div>

          {filteredFAQs.length > 0 ? (
            <div className='space-y-3'>
              {filteredFAQs.map((faq, i) => (
                <FAQAccordion key={i} item={faq} />
              ))}
            </div>
          ) : (
            <div className='text-center py-16 text-gray-400'>
              <Search className='w-10 h-10 mx-auto mb-3 opacity-40' />
              <p className='text-lg font-medium'>No results found</p>
              <p className='text-sm mt-1'>
                Try different keywords or contact our support team.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Still Need Help ── */}
      <section className='py-16 bg-white'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='text-center mb-10'>
            <h2 className='text-2xl font-bold text-gray-800'>
              Still need help?
            </h2>
            <p className='text-gray-500 mt-2 text-sm'>
              Our support team is ready to assist you.
            </p>
          </div>

          <div className='grid sm:grid-cols-3 gap-6'>
            {/* Email */}
            <div className='flex flex-col items-center text-center p-8 rounded-xl border border-gray-200 hover:border-[#10b5cb] hover:shadow-md transition'>
              <div className='w-14 h-14 flex items-center justify-center rounded-full bg-[#10b5cb]/10 mb-4'>
                <Mail className='w-7 h-7 text-[#10b5cb]' />
              </div>
              <h3 className='font-semibold text-gray-800 mb-1'>Email Us</h3>
              <p className='text-sm text-gray-500 mb-4'>
                We typically respond within 24 hours.
              </p>
              <a
                href='mailto:bedadaashetu555@gmail.com'
                className='mt-auto border border-[#10b5cb] text-[#10b5cb] hover:bg-[#10b5cb]/10 text-sm px-5 py-2 rounded-lg transition'
              >
                Send Email
              </a>
            </div>

            {/* Phone */}
            <div className='flex flex-col items-center text-center p-8 rounded-xl border border-gray-200 hover:border-[#10b5cb] hover:shadow-md transition'>
              <div className='w-14 h-14 flex items-center justify-center rounded-full bg-[#10b5cb]/10 mb-4'>
                <Phone className='w-7 h-7 text-[#10b5cb]' />
              </div>
              <h3 className='font-semibold text-gray-800 mb-1'>Call Us</h3>
              <p className='text-sm text-gray-500 mb-4'>
                Available Mon–Fri, 9 AM – 6 PM EAT.
              </p>
              <a
                href='tel:+251914678082'
                className='mt-auto border border-[#10b5cb] text-[#10b5cb] hover:bg-[#10b5cb]/10 text-sm px-5 py-2 rounded-lg transition'
              >
                +251 914 678 082
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
