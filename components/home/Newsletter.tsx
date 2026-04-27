'use client'

import React, { useState } from 'react'
import { getTranslation } from '@/lib/i18n'

export default function Newsletter() {
  const t = getTranslation()

  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSubscribe = async () => {
    setMessage(null)
    setError(null)

    if (!email) {
      setError(t.newsletter.emailRequired)
      return
    }

    if (!isValidEmail(email)) {
      setError(t.newsletter.invalidEmail)
      return
    }

    try {
      setLoading(true)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage(t.newsletter.success)
      setEmail('')
    } catch (err) {
      setError(t.newsletter.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-[#10b5cb]/10 py-12'>
      <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6'>
        {/* Text */}
        <div>
          <h2 className='text-xl font-semibold text-gray-800'>
            {t.newsletter.title}
          </h2>
          <p className='text-gray-600 text-sm'>{t.newsletter.subtitle}</p>
        </div>

        {/* Input */}
        <div className='flex w-full md:w-auto flex-col gap-2'>
          <div className='flex'>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.newsletter.placeholder}
              className='border rounded-l-md px-4 py-2 w-full md:w-64 outline-none'
              disabled={loading}
            />

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className='bg-[#10b5cb] text-white px-6 rounded-r-md hover:bg-[#0e9fb3] disabled:opacity-50'
            >
              {loading ? '...' : t.newsletter.button}
            </button>
          </div>

          {/* Feedback */}
          {message && <p className='text-green-600 text-sm'>{message}</p>}
          {error && <p className='text-red-600 text-sm'>{error}</p>}
        </div>
      </div>
    </div>
  )
}
