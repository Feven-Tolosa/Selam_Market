'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(
      'Account created successfully! Please check your email to confirm your account.  ',
    )
    router.push('/login')
  }

  return (
    <>
      <main className='min-h-screen bg-white flex items-center justify-center px-4'>
        <div className='w-full max-w-md border rounded-xl shadow-sm p-8'>
          <h1 className='text-2xl font-semibold text-center mb-6'>
            Create an account
          </h1>

          <form onSubmit={handleRegister} className='space-y-4'>
            <input
              type='text'
              placeholder='Full name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#10b5cb]'
              required
            />

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

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-[#10b5cb] text-white py-2 rounded-md hover:bg-[#0e9fb3]'
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
