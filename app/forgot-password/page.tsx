'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/update-password',
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Check your email for reset link!')
  }

  return (
    <main className='min-h-screen flex items-center justify-center'>
      <form
        onSubmit={handleReset}
        className='w-full max-w-md p-6 border rounded-xl space-y-4'
      >
        <h1 className='text-xl font-semibold text-center'>Reset Password</h1>

        <input
          type='email'
          placeholder='Enter your email'
          className='w-full border px-4 py-2 rounded-md'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-[#10b5cb] text-white py-2 rounded-md'
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </main>
  )
}
