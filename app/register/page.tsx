'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ Strength logic
  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[@$!%*?&.#^()_\-+=]/.test(password)) score++
    return score
  }

  const getStrengthLabel = (score: number) => {
    if (score <= 2) return 'Weak'
    if (score === 3 || score === 4) return 'Medium'
    return 'Strong'
  }

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500'
    if (score === 3 || score === 4) return 'bg-yellow-400'
    return 'bg-green-500'
  }
  const strength = getPasswordStrength(password)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (strength < 4) {
      toast.error('Password is too weak')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // ❌ REMOVE manual insert
    setLoading(false)

    toast.success('Account created! Check your email.')

    router.push('/login')
  }

  return (
    <main className='max-h-screen my-4 flex items-center justify-center'>
      <div className='w-full max-w-md p-6 border rounded-xl space-y-4'>
        <h1 className='text-xl font-semibold text-center'>Create Account</h1>

        <form onSubmit={handleRegister} className='space-y-4'>
          <input
            type='text'
            placeholder='Full name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full border px-4 py-2 rounded-md'
            required
          />

          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full border px-4 py-2 rounded-md'
            required
          />

          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full border px-4 py-2 rounded-md'
            required
          />

          {/* ✅ Strength Bar */}
          <div className='h-2 w-full bg-gray-200 rounded'>
            <div
              className={`h-2 rounded transition-all duration-300 ${getStrengthColor(strength)}`}
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>

          {/* ✅ Strength Label */}
          <p className='text-xs'>
            Strength:{' '}
            <span
              className={`font-semibold ${
                strength <= 2
                  ? 'text-red-500'
                  : strength <= 4
                    ? 'text-yellow-500'
                    : 'text-green-600'
              }`}
            >
              {getStrengthLabel(strength)}
            </span>
          </p>

          {/* ✅ Checklist */}
          <ul className='text-xs space-y-1'>
            <li
              className={
                password.length >= 8 ? 'text-green-600' : 'text-gray-400'
              }
            >
              ✔ At least 8 characters
            </li>
            <li
              className={
                /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'
              }
            >
              ✔ Uppercase letter
            </li>
            <li
              className={
                /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'
              }
            >
              ✔ Lowercase letter
            </li>
            <li
              className={
                /\d/.test(password) ? 'text-green-600' : 'text-gray-400'
              }
            >
              ✔ Number
            </li>
            <li
              className={
                /[@$!%*?&.#^()_\-+=]/.test(password)
                  ? 'text-green-600'
                  : 'text-gray-400'
              }
            >
              ✔ Special character
            </li>
          </ul>

          <input
            type='password'
            placeholder='Confirm password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className='w-full border px-4 py-2 rounded-md'
            required
          />

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-[#10b5cb] text-white py-2 rounded-md'
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </main>
  )
}
