'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { Shield, ChevronRight } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const sections = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: [
      {
        heading: 'Account Information',
        body: 'When you register, we collect your name, email address, phone number, and password. Vendors additionally provide business name, address, and tax identification details.',
      },
      {
        heading: 'Transaction Data',
        body: 'We record details of purchases and sales made through the platform, including product details, prices, payment method type, and delivery addresses.',
      },
      {
        heading: 'Usage Data',
        body: 'We automatically collect information about how you interact with our system — pages visited, search queries, clicks, device type, browser, IP address, and referring URLs.',
      },
      {
        heading: 'Communications',
        body: 'If you contact our support team or message a vendor through the platform, we retain those communications to resolve disputes and improve our service.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: [
      {
        heading: 'Service Delivery',
        body: 'To process orders, facilitate payments, connect buyers with vendors, and provide customer support.',
      },
      {
        heading: 'Personalization',
        body: 'To recommend products, display relevant categories, and tailor your experience based on browsing and purchase history.',
      },
      {
        heading: 'Security & Fraud Prevention',
        body: 'To detect suspicious activity, verify vendor identities, and protect users from unauthorized transactions.',
      },
      {
        heading: 'Communications',
        body: 'To send order confirmations, promotional offers, and important service announcements.',
      },
      {
        heading: 'Legal Compliance',
        body: 'To comply with applicable Ethiopian and international laws, respond to lawful requests, and enforce our Terms of Service.',
      },
    ],
  },
  {
    id: 'sharing',
    title: '3. Sharing Your Information',
    content: [
      {
        heading: 'With Vendors',
        body: 'When you place an order, we share your name, delivery address, and contact details with the relevant vendor solely to fulfill that order.',
      },
      {
        heading: 'Payment Processors',
        body: 'Payment data is handled by our certified payment partners. We do not store full card numbers on our servers.',
      },
      {
        heading: 'Service Providers',
        body: 'We work with trusted third-party providers for hosting, analytics, email delivery, and customer support tools. They are contractually bound to protect your data.',
      },
      {
        heading: 'Legal Requirements',
        body: 'We may disclose information when required by law, court order, or to protect the rights and safety of our users and the public.',
      },
      {
        heading: 'No Sale of Data',
        body: 'We do not sell, rent, or trade your personal information to third parties for their own marketing purposes.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies & Tracking',
    content: [
      {
        heading: 'Essential Cookies',
        body: 'Required for the platform to function — keeping you logged in, remembering your cart, and maintaining session security.',
      },
      {
        heading: 'Analytics Cookies',
        body: 'Help us understand how users navigate the site so we can improve performance and usability. We use anonymized data only.',
      },
      {
        heading: 'Preference Cookies',
        body: 'Remember your language, location, and display preferences across visits.',
      },
      {
        heading: 'Managing Cookies',
        body: 'You can disable non-essential cookies through your browser settings. Note that some features may not work correctly without them.',
      },
    ],
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    content: [
      {
        heading: 'Active Accounts',
        body: 'We retain your data for as long as your account is active or as needed to provide services.',
      },
      {
        heading: 'Deleted Accounts',
        body: 'When you delete your account, we remove personal data within 30 days, except where retention is required by law (e.g., transaction records for tax purposes — retained for 7 years).',
      },
      {
        heading: 'Anonymized Data',
        body: 'Aggregated, anonymized analytics data may be retained indefinitely as it cannot be linked back to any individual.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: [
      {
        heading: 'Access',
        body: 'You can request a copy of the personal data we hold about you at any time through your account settings or by contacting support.',
      },
      {
        heading: 'Correction',
        body: 'You can update inaccurate or incomplete information directly in your profile, or ask us to correct it.',
      },
      {
        heading: 'Deletion',
        body: 'You may request deletion of your account and associated personal data, subject to legal retention obligations.',
      },
      {
        heading: 'Portability',
        body: 'You can request your data in a structured, machine-readable format to transfer to another service.',
      },
      {
        heading: 'Opt-Out',
        body: 'You can unsubscribe from marketing emails at any time using the unsubscribe link in any email, or through your notification settings.',
      },
    ],
  },
  {
    id: 'security',
    title: '7. Security',
    content: [
      {
        heading: 'Encryption',
        body: 'All data transmitted between your browser and our servers is encrypted using TLS (HTTPS). Sensitive data at rest is encrypted using AES-256.',
      },
      {
        heading: 'Access Controls',
        body: 'Only authorized personnel with a legitimate business need can access personal data. Access is logged and audited regularly.',
      },
      {
        heading: 'Incident Response',
        body: 'In the event of a data breach that affects your rights, we will notify you and relevant authorities within 72 hours as required by applicable law.',
      },
    ],
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    content: [
      {
        heading: 'Age Requirement',
        body: 'Our system is not intended for users under the age of 18. We do not knowingly collect personal data from minors.',
      },
      {
        heading: 'Parental Action',
        body: 'If you believe a minor has created an account, please contact us immediately at support@selammarket.com and we will delete the account promptly.',
      },
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: [
      {
        heading: 'Notification',
        body: 'We may update this Privacy Policy from time to time. When we make significant changes, we will notify you via email or a prominent notice on the platform at least 14 days before the changes take effect.',
      },
      {
        heading: 'Continued Use',
        body: 'Your continued use of Selam Marketplace after the effective date of any changes constitutes your acceptance of the updated policy.',
      },
    ],
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: [
      {
        heading: 'Data Controller',
        body: 'Local Vendor Findor, Friendship Building, Jimma, Ethiopia.',
      },
      {
        heading: 'Privacy Inquiries',
        body: 'For any privacy-related questions or to exercise your rights, email us or visit our Contact Us page.',
      },
    ],
  },
]

// ─── Section Component ─────────────────────────────────────────────────────────

function PolicySection({
  section,
  active,
}: {
  section: (typeof sections)[0]
  active: boolean
}) {
  return (
    <div
      id={section.id}
      className={`scroll-mt-24 rounded-2xl border p-8 transition ${
        active
          ? 'border-[#10b5cb] shadow-md bg-white'
          : 'border-gray-200 bg-white'
      }`}
    >
      <h2 className='text-lg font-bold text-gray-900 mb-5'>{section.title}</h2>
      <div className='space-y-4'>
        {section.content.map((item, i) => (
          <div key={i}>
            <h3 className='text-sm font-semibold text-gray-800 mb-1'>
              {item.heading}
            </h3>
            <p className='text-sm text-gray-600 leading-relaxed'>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const scrollTo = (id: string) => {
    setActiveId(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* ── Hero ── */}
      <section className='bg-gradient-to-br from-[#10b5cb]/20 via-white to-[#10b5cb]/5 py-20'>
        <div className='max-w-3xl mx-auto px-6 text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10b5cb]/10 mb-6'>
            <Shield className='w-8 h-8 text-[#10b5cb]' />
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900'>
            Privacy <span className='text-[#10b5cb]'>Policy</span>
          </h1>
          <p className='mt-4 text-gray-500 text-lg'>
            We take your privacy seriously. This policy explains what data we
            collect, how we use it, and your rights.
          </p>
          <p className='mt-3 text-sm text-gray-400'>
            Last updated: <span className='font-medium text-gray-500'>April 21, 2026</span>
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className='py-14 bg-gray-50'>
        <div className='max-w-6xl mx-auto px-6 flex gap-10 items-start'>

          {/* Sticky Table of Contents */}
          <aside className='hidden lg:block w-64 shrink-0 sticky top-24'>
            <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-5'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4'>
                Contents
              </p>
              <nav className='space-y-1'>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition ${
                      activeId === s.id
                        ? 'bg-[#10b5cb]/10 text-[#10b5cb] font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition ${
                        activeId === s.id ? 'text-[#10b5cb]' : 'text-gray-300'
                      }`}
                    />
                    <span className='leading-snug'>{s.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy Sections */}
          <div className='flex-1 space-y-6'>
            {/* Intro banner */}
            <div className='bg-[#10b5cb]/10 border border-[#10b5cb]/30 rounded-2xl px-6 py-5 text-sm text-gray-700 leading-relaxed'>
              This Privacy Policy applies to all users of{' '}
              <span className='font-semibold text-gray-900'>
                Local Vendor Finder
              </span>{' '}
              — buyers, vendors, and visitors. By using our platform, you agree
              to the collection and use of information as described here. If you
              have questions, visit our{' '}
              <Link
                href='/contact'
                className='text-[#10b5cb] hover:underline font-medium'
              >
                Contact Us
              </Link>{' '}
              page.
            </div>

            {sections.map((s) => (
              <PolicySection
                key={s.id}
                section={s}
                active={activeId === s.id}
              />
            ))}

            {/* Footer note */}
            <div className='text-center pt-4 pb-2'>
              <p className='text-sm text-gray-400'>
                Questions about this policy?{' '}
                <Link
                  href='/contact'
                  className='text-[#10b5cb] hover:underline font-medium'
                >
                  Contact our privacy team →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
