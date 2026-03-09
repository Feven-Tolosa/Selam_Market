import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
  return (
    <>
      <main className='min-h-screen bg-white flex items-center justify-center px-4'>
        <div className='w-full max-w-md border rounded-xl shadow-sm p-8'>
          {/* Title */}
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-4'>
              <div className='bg-[#10b5cb]/10 p-3 rounded-full'>
                <UserPlus className='text-[#10b5cb]' size={26} />
              </div>
            </div>

            <h1 className='text-2xl font-semibold text-gray-800'>
              Create an account
            </h1>

            <p className='text-gray-500 text-sm mt-1'>
              Join the marketplace and start exploring
            </p>
          </div>

          {/* Form */}
          <form className='space-y-5'>
            {/* Name */}
            <div>
              <label className='text-sm text-gray-600'>Full Name</label>
              <input
                type='text'
                placeholder='John Doe'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

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

            {/* Confirm Password */}
            <div>
              <label className='text-sm text-gray-600'>Confirm Password</label>
              <input
                type='password'
                placeholder='Confirm password'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            {/* Button */}
            <button
              type='submit'
              className='w-full bg-[#10b5cb] hover:bg-[#0e9fb3] text-white py-2 rounded-md font-medium transition'
            >
              Create Account
            </button>
          </form>

          {/* Login link */}
          <p className='text-center text-sm text-gray-500 mt-6'>
            Already have an account?{' '}
            <a
              href='/login'
              className='text-[#10b5cb] font-medium hover:underline'
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
    </>
  )
}
