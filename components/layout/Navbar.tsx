'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, Store, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import LanguageSwitcher from '../Language/LanguageSwitcher'
import toast from 'react-hot-toast'

type VendorStatus = 'none' | 'pending' | 'approved' | 'rejected'

type UserType = {
  id: string
  email?: string
  role: string
  avatar_url?: string
  vendor_status: VendorStatus
}

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ✅ Fetch everything properly
  const fetchUser = async () => {
    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      setUser(null)
      return
    }

    const userId = authData.user.id

    // 👤 Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('role, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    // 🏪 Get vendor request (latest)
    const { data: vendorData } = await supabase
      .from('vendor_requests')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const role =
      authData.user.app_metadata?.role ||
      authData.user.user_metadata?.role ||
      userData?.role ||
      'user'

    setUser({
      id: userId,
      email: authData.user.email ?? undefined,
      role: (
        authData.user.app_metadata?.role ||
        authData.user.user_metadata?.role ||
        userData?.role ||
        'user'
      ).toLowerCase(),
      avatar_url: userData?.avatar_url ?? undefined,
      vendor_status: (vendorData?.status as VendorStatus) ?? 'none',
    })
    console.log('AUTH USER:', authData.user)
  }

  useEffect(() => {
    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // ✅ Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
    window.location.href = '/'
  }

  // ✅ Vendor click logic (FULL STATES)
  const handleVendorClick = () => {
    if (!user) return

    switch (user.vendor_status) {
      case 'approved':
        window.location.href = '/vendor/dashboard'
        break

      case 'pending':
        toast('Your vendor request is pending approval ⏳')
        break

      case 'rejected':
        toast('Your request was rejected. You can apply again.')
        window.location.href = '/vendor/onboarding'
        break

      default:
        window.location.href = '/vendor/onboarding'
    }
  }

  // 👤 Initial fallback
  const getInitial = (email?: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U'
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
            className='w-full rounded-md py-2 px-4 border ring-1 ring-[#55b8c5] focus:ring-2 focus:ring-[#10b5cb] outline-none'
          />
        </div>

        {/* Right Side */}
        <div className='flex items-center gap-6'>
          <LanguageSwitcher />

          <button className='hover:text-[#10b5cb]'>
            <ShoppingCart size={22} />
          </button>

          {!user ? (
            <>
              <Link href='/login'>Login</Link>
              <Link
                href='/register'
                className='bg-[#10b5cb] text-white px-4 py-1.5 rounded-md'
              >
                Register
              </Link>
            </>
          ) : (
            <div className='relative' ref={dropdownRef}>
              {/* 👤 Avatar */}
              <button
                onClick={() => setOpen((prev) => !prev)}
                className='flex items-center gap-2'
              >
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt='avatar'
                    width={32}
                    height={32}
                    className='rounded-full object-cover'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-[#10b5cb] text-white flex items-center justify-center'>
                    {getInitial(user.email)}
                  </div>
                )}

                <ChevronDown size={16} />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-md transition-all duration-200 ${
                  open
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                {/* 🏪 Vendor Status Badge */}
                <div className='px-4 py-2 text-sm'>
                  {user.vendor_status === 'approved' && (
                    <span className='text-green-600'>✔ Approved Vendor</span>
                  )}
                  {user.vendor_status === 'pending' && (
                    <span className='text-yellow-500'>⏳ Pending Approval</span>
                  )}
                  {user.vendor_status === 'rejected' && (
                    <span className='text-red-500'>✖ Rejected</span>
                  )}
                </div>
                <div className='px-4 py-1 text-xs text-gray-400'>
                  role: {user?.role}
                </div>
                {/* Vendor Button */}
                <button
                  onClick={handleVendorClick}
                  className='flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-50'
                >
                  <Store size={16} />
                  Vendor
                </button>

                {/* Admin */}
                {user.role === 'admin' && (
                  <Link
                    href='/admin'
                    className='block px-4 py-2 hover:bg-gray-50'
                  >
                    Admin
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className='w-full text-left px-4 py-2 text-red-500 hover:bg-gray-50'
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
