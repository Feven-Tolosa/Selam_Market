'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, User, Store, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import LanguageSwitcher from '../Language/LanguageSwitcher'

type UserType = {
  id: string
  email?: string
  role?: string
}

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setUser(null)
        return
      }

      // get role from users table
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
        role: userData?.role,
      })
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className='bg-white border-b shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 py-2 flex h-16 items-center justify-between'>
        {/* Logo */}
        <Link href='/'>
          <Image
            src='/logo.png'
            alt='Logo'
            width={120}
            height={40}
            className='object-contain pt-3'
          />
        </Link>

        {/* Search */}
        <div className='flex-1 px-6 hidden md:block'>
          <input
            type='text'
            placeholder='Search products...'
            className='w-full rounded-md py-2 px-4 border focus:ring-2 focus:ring-[#10b5cb] outline-none'
          />
        </div>

        {/* Right Side */}
        <div className='flex items-center gap-6'>
          {/* Language Switcher */}
          <div className='transition duration-200 hover:scale-110'>
            <LanguageSwitcher />
          </div>

          {/* Cart */}
          <button className='hover:text-[#10b5cb] transition'>
            <ShoppingCart size={22} />
          </button>

          {!user ? (
            <>
              <Link href='/login' className='hover:text-[#10b5cb]'>
                Login
              </Link>

              <Link
                href='/register'
                className='bg-[#10b5cb] text-white px-4 py-1.5 rounded-md hover:opacity-90 transition'
              >
                Register
              </Link>
            </>
          ) : (
            <div
              className='relative'
              onDoubleClick={() => setOpen(true)}
              onClick={() => setOpen(false)}
            >
              {/* User Icon */}
              <button className='flex items-center gap-1 hover:text-[#10b5cb] transition'>
                <User size={22} />
                <ChevronDown size={16} />
              </button>

              {/* Dropdown */}
              {open && (
                <div className='absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2'>
                  <Link
                    href='/vendor/onboarding'
                    className='flex items-center gap-2 px-4 py-2 hover:bg-gray-50'
                  >
                    <Store size={16} />
                    Vendor
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href='/admin'
                      className='flex items-center gap-2 px-4 py-2 hover:bg-gray-50'
                    >
                      <User size={16} />
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className='w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500'
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
