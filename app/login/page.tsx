'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Logged in successfully!')
    router.push('/')
  }

  return (
    <>
      <main className='max-h-screen pt-8 bg-white flex items-center justify-center px-4'>
        <div className='w-full max-w-md border rounded-xl shadow-sm p-8'>
          <h1 className='text-2xl font-semibold text-center mb-6'>Sign in</h1>

          <form onSubmit={handleLogin} className='space-y-4'>
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#10b5cb]'
              required
            />

            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#10b5cb]'
              required
            />
            {/* Forgot Password */}
            <p className='text-right text-sm'>
              <button
                type='button'
                onClick={() => router.push('/forgot-password')}
                className='text-[#10b5cb] hover:underline'
              >
                Forgot Password?
              </button>
            </p>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-[#10b5cb] text-white py-2 rounded-md hover:bg-[#0e9fb3]'
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
