'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, User, Menu, Store } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import LanguageSwitcher from '../Language/LanguageSwitcher'

export default function Navbar() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className='bg-[#b6f0fa] text-gray-700 shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 flex h-16 items-center justify-between'>
        {/* Logo */}
        <Link href='/'>
          <Image
            src='/logo.png'
            alt='Logo'
            width={120}
            height={40}
            className='pt-5'
          />
        </Link>
        <LanguageSwitcher />
        {/* Search */}
        <div className='flex-1 px-6'>
          <input
            type='text'
            placeholder='Search products...'
            className='w-full rounded-md py-2 px-4 bg-white border focus:border-[#10b5cb]'
          />
        </div>

        {/* Right Side */}
        <div className='flex items-center space-x-6'>
          <button>
            <ShoppingCart size={22} />
          </button>
          <>
            {user ? (
              <>
                <Link
                  href='/vendor/onboarding'
                  className='flex items-center gap-1'
                >
                  <Store size={18} />
                  Vendor
                </Link>

                <Link href='/vendor/dashboard' onClick={handleLogout}>
                  <User size={22} />
                </Link>
              </>
            ) : (
              <>
                <Link href='/login'>Login</Link>

                <Link
                  href='/register'
                  className='bg-[#10b5cb] text-white px-4 py-1.5 rounded-md'
                >
                  Register
                </Link>
              </>
            )}
          </>
        </div>
      </div>
    </header>
  )
}
