import { LogIn } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <>
      <main className='min-h-screen bg-white flex items-center justify-center px-4'>
        <div className='w-full max-w-md border rounded-xl shadow-sm p-8'>
          {/* Title */}
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-4'>
              <div className='bg-[#10b5cb]/10 p-3 rounded-full'>
                <LogIn className='text-[#10b5cb]' size={26} />
              </div>
            </div>

            <h1 className='text-2xl font-semibold text-gray-800'>
              Welcome back
            </h1>

            <p className='text-gray-500 text-sm mt-1'>
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form className='space-y-5'>
            {/* Email */}
            <div>
              <label className='text-sm text-gray-600'>Email</label>
              <input
                type='email'
                placeholder='example@email.com'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            {/* Password */}
            <div>
              <label className='text-sm text-gray-600'>Password</label>
              <input
                type='password'
                placeholder='Enter password'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            {/* Forgot password */}
            <div className='flex justify-end'>
              <Link
                href='/forgot-password'
                className='text-sm text-[#10b5cb] hover:underline'
              >
                Forgot password?
              </Link>
            </div>

            {/* Login button */}
            <button
              type='submit'
              className='w-full bg-[#10b5cb] hover:bg-[#0e9fb3] text-white py-2 rounded-md font-medium transition'
            >
              Sign In
            </button>
          </form>

          {/* Register link */}
          <p className='text-center text-sm text-gray-500 mt-6'>
            Don&apos;t have an account?{' '}
            <Link
              href='/register'
              className='text-[#10b5cb] font-medium hover:underline'
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
