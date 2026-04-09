'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, Store, ChevronDown, Search } from 'lucide-react'
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

type ProductSearchResult = {
  id: string
  name: string
  image_url: string | null
  price: number
  type: 'product'
}

type VendorSearchResult = {
  id: string
  store_name: string
  type: 'vendor'
}

type SearchResult = ProductSearchResult | VendorSearchResult

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const [open, setOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // 🔍 SEARCH STATE (ONLY ADDITION)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  // ✅ Fetch user + role + vendor status
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        setUser(null)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const { data: vendorData } = await supabase
        .from('vendor_requests')
        .select('status')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const status = (vendorData?.status || 'none')
        .toLowerCase()
        .trim() as VendorStatus

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

  // 🔍 LIVE SEARCH (ONLY ADDITION)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, name, image_url, price')
        .ilike('name', `%${query}%`)
        .limit(5)

      const { data: vendors } = await supabase
        .from('users')
        .select('id, store_name')
        .ilike('store_name', `%${query}%`)
        .limit(5)

      const formatted: SearchResult[] = [
        ...(products || []).map(
          (p): ProductSearchResult => ({
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            price: p.price,
            type: 'product',
          }),
        ),
        ...(vendors || []).map(
          (v): VendorSearchResult => ({
            id: v.id,
            store_name: v.store_name,
            type: 'vendor',
          }),
        ),
      ]

      setResults(formatted)
      setShowDropdown(true)
    }, 300)

    return () => clearTimeout(delay)
  }, [query])

  // 🔍 Close search dropdown (ONLY ADDITION — merged safely with existing logic)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }

      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
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

  // ✅ Vendor click logic (UNCHANGED)
  const handleVendorClick = () => {
    if (!user) return

    switch (user.vendor_status) {
      case 'approved':
        router.push('/vendor/dashboard')
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

        {/* 🔍 SEARCH BAR (UPDATED ONLY THIS SECTION) */}
        <div className='flex-1 px-6 hidden md:block' ref={searchRef}>
          <div className='relative'>
            <Search
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />

            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setShowDropdown(true)}
              placeholder='Search products or stores...'
              className='w-full rounded-md py-2 pl-10 pr-4 border ring-1 ring-[#55b8c5] focus:ring-2 focus:ring-[#10b5cb] outline-none transition duration-200'
            />

            {/* DROPDOWN */}
            {showDropdown && results.length > 0 && (
              <div className='absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg mt-2 z-50 max-h-80 overflow-y-auto'>
                {/* PRODUCTS */}
                {results
                  .filter((r): r is ProductSearchResult => r.type === 'product')
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      onClick={() => setShowDropdown(false)}
                      className='flex items-center gap-3 px-4 py-2 hover:bg-gray-100'
                    >
                      <Image
                        src={item.image_url || '/placeholder.png'}
                        alt={item.name}
                        width={40}
                        height={40}
                        className='rounded object-cover'
                      />
                      <div>
                        <p className='text-sm font-medium'>{item.name}</p>
                        <p className='text-xs text-[#10b5cb]'>
                          ETB {item.price}
                        </p>
                      </div>
                    </Link>
                  ))}

                {/* VENDORS */}
                {results
                  .filter((r): r is VendorSearchResult => r.type === 'vendor')
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={`/vendor/${item.id}`}
                      onClick={() => setShowDropdown(false)}
                      className='flex items-center gap-3 px-4 py-2 hover:bg-gray-100'
                    >
                      <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                        🏪
                      </div>
                      <p className='text-sm font-medium'>{item.store_name}</p>
                    </Link>
                  ))}

                {/* VIEW ALL */}
                <Link
                  href={`/search?q=${query}`}
                  onClick={() => setShowDropdown(false)}
                  className='block text-center py-2 text-sm text-[#10b5cb] border-t hover:underline'
                >
                  View all results
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE (UNCHANGED) */}
        <div className='flex items-center gap-6'>
          <div className='transition duration-200 hover:scale-110 mt-2'>
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
                <button
                  onClick={() => setOpen((prev) => !prev)}
                  className='flex items-center gap-2'
                >
                  <div className='w-8 h-8 rounded-full bg-[#10b5cb] text-white flex items-center justify-center text-sm font-semibold'>
                    {getInitials(user.email)}
                  </div>
                  <ChevronDown size={16} />
                </button>

                <div
                  className={`absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                    open
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
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

                  <button
                    onClick={handleVendorClick}
                    className='flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left'
                  >
                    <Store size={16} />
                    Vendor
                  </button>

                  {user.role === 'admin' && (
                    <Link
                      href='/admin'
                      className='block px-4 py-2 hover:bg-gray-50'
                    >
                      Admin
                    </Link>
                  )}

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
