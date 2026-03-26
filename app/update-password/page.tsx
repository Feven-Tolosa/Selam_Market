'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function UpdatePasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/
    return regex.test(password)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ Check match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // ✅ Check strength
    if (!validatePassword(password)) {
      toast.error(
        'Password must be 8+ chars, include uppercase, lowercase, number, and special character',
      )
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Password updated successfully!')
    router.push('/login')
  }

  return (
    <main className='min-h-screen flex items-center justify-center'>
      <form
        onSubmit={handleUpdate}
        className='w-full max-w-md p-6 border rounded-xl space-y-4'
      >
        <h1 className='text-xl font-semibold text-center'>Set New Password</h1>

        <input
          type='password'
          placeholder='New password'
          className='w-full border px-4 py-2 rounded-md'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type='password'
          placeholder='Confirm password'
          className='w-full border px-4 py-2 rounded-md'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* ✅ Password Rules UI */}
        <p className='text-xs text-gray-500'>
          Must contain at least 8 characters, uppercase, lowercase, number, and
          special character.
        </p>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-[#10b5cb] text-white py-2 rounded-md'
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </main>
  )
}
