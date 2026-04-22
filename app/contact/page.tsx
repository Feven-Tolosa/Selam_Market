'use client'

import { useState } from 'react'
import Footer from '@/components/layout/Footer'
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react'

// ─── Contact info cards data ───────────────────────────────────────────────────

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    lines: ['+251 911 000 000', '+251 922 000 000'],
    sub: 'Mon–Fri, 9 AM – 6 PM EAT',
  },
  {
    icon: Mail,
    title: 'Email',
    lines: ['bedadaashetu555@gmail.com', 'lewitedese33@gmail.com'],
    sub: 'We reply within 24 hours',
  },
  {
    icon: MapPin,
    title: 'Office',
    lines: ['Jimma, Ethiopia'],
    sub: 'Open Mon–Sat, 9 AM – 5 PM',
  },
  {
    icon: Clock,
    title: 'Support Hours',
    lines: ['Mon – Fri: 9 AM – 6 PM', 'Sat: 10 AM – 3 PM'],
    
  },
]

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate async send
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    form.subject.trim() &&
    form.message.trim()

  return (
    <>
      {/* ── Hero ── */}
      <section className='bg-gradient-to-br from-[#10b5cb]/20 via-white to-[#10b5cb]/5 py-20'>
        <div className='max-w-3xl mx-auto px-6 text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10b5cb]/10 mb-6'>
            <MessageCircle className='w-8 h-8 text-[#10b5cb]' />
          </div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900'>
            Get in <span className='text-[#10b5cb]'>Touch</span>
          </h1>
          <p className='mt-4 text-gray-500 text-lg max-w-xl mx-auto'>
            Have a question, feedback, or need support? We'd love to hear from
            you. Our team is here to help.
          </p>
        </div>
      </section>

      {/* ── Contact Info Cards ── */}
      <section className='py-14 bg-white'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {contactInfo.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className='flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 hover:border-[#10b5cb] hover:shadow-md transition'
                >
                  <div className='w-12 h-12 flex items-center justify-center rounded-full bg-[#10b5cb]/10 mb-4'>
                    <Icon className='w-6 h-6 text-[#10b5cb]' />
                  </div>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    {item.title}
                  </h3>
                  {item.lines.map((line, i) => (
                    <p key={i} className='text-sm text-gray-700 leading-relaxed'>
                      {line}
                    </p>
                  ))}
                  <p className='text-xs text-gray-400 mt-2'>{item.sub}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Form + Map ── */}
      <section className='py-14 bg-gray-50'>
        <div className='max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12'>

          {/* Contact Form */}
          <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-8'>
            {submitted ? (
              <div className='flex flex-col items-center justify-center h-full text-center py-12'>
                <div className='w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4'>
                  <CheckCircle className='w-8 h-8 text-green-500' />
                </div>
                <h2 className='text-xl font-bold text-gray-800 mb-2'>
                  Message Sent!
                </h2>
                <p className='text-gray-500 text-sm max-w-xs'>
                  Thanks for reaching out. We'll get back to you within 24
                  hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({
                      name: '',
                      email: '',
                      subject: '',
                      category: '',
                      message: '',
                    })
                  }}
                  className='mt-6 text-sm text-[#10b5cb] hover:underline'
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className='text-xl font-bold text-gray-800 mb-1'>
                  Send us a message
                </h2>
                <p className='text-sm text-gray-500 mb-6'>
                  Fill in the form and we'll respond as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className='space-y-4'>
                  {/* Name + Email */}
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Full Name <span className='text-red-400'>*</span>
                      </label>
                      <input
                        type='text'
                        name='name'
                        value={form.name}
                        onChange={handleChange}
                        placeholder='Enter Name'
                        required
                        className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#10b5cb] focus:ring-2 focus:ring-[#10b5cb]/20 text-sm transition'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email <span className='text-red-400'>*</span>
                      </label>
                      <input
                        type='email'
                        name='email'
                        value={form.email}
                        onChange={handleChange}
                        placeholder='Enter Your Email'
                        required
                        className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#10b5cb] focus:ring-2 focus:ring-[#10b5cb]/20 text-sm transition'
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Category
                    </label>
                    <select
                      name='category'
                      value={form.category}
                      onChange={handleChange}
                      className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#10b5cb] focus:ring-2 focus:ring-[#10b5cb]/20 text-sm text-gray-700 transition bg-white'
                    >
                      <option value=''>Select a topic</option>
                      <option value='order'>Order Issue</option>
                      <option value='payment'>Payment & Billing</option>
                      <option value='vendor'>Vendor Support</option>
                      <option value='account'>Account & Security</option>
                      <option value='return'>Returns & Refunds</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Subject <span className='text-red-400'>*</span>
                    </label>
                    <input
                      type='text'
                      name='subject'
                      value={form.subject}
                      onChange={handleChange}
                      placeholder='Brief description of your issue'
                      required
                      className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#10b5cb] focus:ring-2 focus:ring-[#10b5cb]/20 text-sm transition'
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Message <span className='text-red-400'>*</span>
                    </label>
                    <textarea
                      name='message'
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder='Describe your issue or question in detail…'
                      required
                      className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#10b5cb] focus:ring-2 focus:ring-[#10b5cb]/20 text-sm transition resize-none'
                    />
                  </div>

                  <button
                    type='submit'
                    disabled={!isValid || loading}
                    className='w-full flex items-center justify-center gap-2 bg-[#10b5cb] hover:bg-[#0e9fb3] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium text-sm transition'
                  >
                    {loading ? (
                      <>
                        <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className='w-4 h-4' />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Map + Social */}
          <div className='flex flex-col gap-6'>
            {/* Embedded Map */}
            <div className='rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex-1 min-h-[300px]'>
              <iframe
                title='Selam Market Office Location'
                src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.7578!3d9.0192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDEnMDkuMSJOIDM4wrA0NSczNy4xIkU!5e0!3m2!1sen!2set!4v1680000000000!5m2!1sen!2set'
                width='100%'
                height='100%'
                style={{ border: 0, minHeight: '300px' }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
            </div>

            {/* Social Links */}
            <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6'>
              <h3 className='font-semibold text-gray-800 mb-4'>
                Follow us on social media
              </h3>
              <div className='flex flex-col gap-3'>
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-[#10b5cb] hover:bg-[#10b5cb]/5 transition group'
                  >
                    <div className='w-9 h-9 flex items-center justify-center rounded-full bg-[#10b5cb]/10 group-hover:bg-[#10b5cb]/20 transition'>
                      <Icon className='w-4 h-4 text-[#10b5cb]' />
                    </div>
                    <span className='text-sm font-medium text-gray-700 group-hover:text-[#10b5cb] transition'>
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
