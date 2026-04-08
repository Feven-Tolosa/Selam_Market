'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, Store, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import LanguageSwitcher from '../Language/LanguageSwitcher'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type VendorStatus = 'none' | 'pending' | 'approved' | 'rejected'

type UserType = {
  id: string
  email?: string
  role?: string
  avatar_url?: string
  vendor_status: VendorStatus
}

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ✅ Fetch user + role + vendor status
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setUser(null)
        return
      }

      // 👤 user info
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // 🏪 vendor request info (LATEST request)
      const { data: vendorData } = await supabase
        .from('vendor_requests')
        .select('status')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false }) // ✅ FIX
        .limit(1) // ✅ FIX
        .maybeSingle()

      // ✅ Normalize status (CRITICAL FIX)
      const status = (vendorData?.status || 'none')
        .toLowerCase()
        .trim() as VendorStatus

      console.log('Vendor status from DB:', vendorData?.status) // ✅ DEBUG

      setUser({
        id: data.user.id,
        email: data.user.email ?? undefined,
        role: userData?.role,
        vendor_status: status,
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

  // ✅ Click outside close
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
  }

  // ✅ Vendor click logic (UNCHANGED behavior)
  const handleVendorClick = () => {
    if (!user) return

    switch (user.vendor_status) {
      case 'approved':
        router.push('/vendor/dashboard') // ✅ better than reload
        break

      case 'pending':
        toast('Your vendor request is pending approval ⏳')
        break

      case 'rejected':
        toast('Your request was rejected. You can apply again.')
        router.push('/vendor/onboarding')
        break

      default:
        router.push('/vendor/onboarding')
    }
  }

  // 👤 Generate initials fallback
  const getInitials = (email?: string) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
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
            className='w-full rounded-md py-2 px-4 border ring-1 ring-[#55b8c5] focus:ring-2 focus:ring-[#10b5cb] outline-none transition duration-200'
          />
        </div>

        {/* Right Side */}
        <div className='flex items-center gap-6'>
          {/* Language Switcher */}
          <div className='transition duration-200 hover:scale-110'>
            <LanguageSwitcher />
          </div>

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
            <>
              <Link href='/cart' className='hover:text-[#10b5cb] transition'>
                <ShoppingCart size={22} />
              </Link>

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
                    <div className='w-8 h-8 rounded-full bg-[#10b5cb] text-white flex items-center justify-center text-sm font-semibold'>
                      {getInitials(user.email)}
                    </div>
                  )}

                  <ChevronDown size={16} />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
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
                      <span className='text-yellow-500'>
                        ⏳ Pending Approval
                      </span>
                    )}
                    {user.vendor_status === 'rejected' && (
                      <span className='text-red-500'>✖ Rejected</span>
                    )}
                  </div>

                  {/* Vendor Button */}
                  <button
                    onClick={handleVendorClick}
                    className='flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left'
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
            </>
          )}
        </div>
      </div>
    </header>
  )
}
