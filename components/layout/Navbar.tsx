'use client'

import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, Store, ChevronDown, Search } from 'lucide-react'
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

type ProductSearch = {
  id: string
  name: string
}

type VendorSearch = {
  id: string
  store_name: string
}

type SearchResults = {
  products: ProductSearch[]
  vendors: VendorSearch[]
}

type ActiveItem =
  | { type: 'product'; index: number }
  | { type: 'vendor'; index: number }
  | null

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState<string>('')
  const [results, setResults] = useState<SearchResults>({
    products: [],
    vendors: [],
  })
  const [activeItem, setActiveItem] = useState<ActiveItem>(null)
  const [showResults, setShowResults] = useState<boolean>(false)

  const searchRef = useRef<HTMLDivElement>(null)
  // useEffect(() => {
  //   const delayDebounce = setTimeout(async () => {
  //     if (!search.trim()) {
  //       setResults({ products: [], vendors: [] })
  //       return
  //     }

  //     // 🔍 Products
  //     const { data: products } = await supabase
  //       .from('products')
  //       .select('id, name')
  //       .ilike('name', `%${search}%`)
  //       .limit(5)

  //     // 🏪 Vendors
  //     const { data: vendors } = await supabase
  //       .from('vendors')
  //       .select('id, store_name')
  //       .ilike('store_name', `%${search}%`)
  //       .limit(5)

  //     setResults({
  //       products: products ?? [],
  //       vendors: vendors ?? [],
  //     })
  //   }, 300) // debounce

  //   return () => clearTimeout(delayDebounce)
  // }, [search])

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setResults({ products: [], vendors: [] })
        setShowResults(false)
        return
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', `%${search}%`)
        .limit(5)

      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, store_name')
        .ilike('store_name', `%${search}%`)
        .limit(5)

      setResults({
        products: products ?? [],
        vendors: vendors ?? [],
      })

      setShowResults(true)
    }, 300)

    return () => clearTimeout(delay)
  }, [search])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
        setActiveItem(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = results.products.length + results.vendors.length

    if (!totalItems) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()

      if (!activeItem) {
        setActiveItem({ type: 'product', index: 0 })
        return
      }

      if (activeItem.type === 'product') {
        if (activeItem.index < results.products.length - 1) {
          setActiveItem({
            type: 'product',
            index: activeItem.index + 1,
          })
        } else if (results.vendors.length > 0) {
          setActiveItem({ type: 'vendor', index: 0 })
        }
      } else {
        if (activeItem.index < results.vendors.length - 1) {
          setActiveItem({
            type: 'vendor',
            index: activeItem.index + 1,
          })
        }
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()

      if (!activeItem) return

      if (activeItem.type === 'vendor') {
        if (activeItem.index > 0) {
          setActiveItem({
            type: 'vendor',
            index: activeItem.index - 1,
          })
        } else if (results.products.length > 0) {
          setActiveItem({
            type: 'product',
            index: results.products.length - 1,
          })
        }
      } else {
        if (activeItem.index > 0) {
          setActiveItem({
            type: 'product',
            index: activeItem.index - 1,
          })
        }
      }
    }

    if (e.key === 'Enter') {
      if (!activeItem) return

      if (activeItem.type === 'product') {
        const item = results.products[activeItem.index]
        window.location.href = `/product/${item.id}`
      }

      if (activeItem.type === 'vendor') {
        const item = results.vendors[activeItem.index]
        window.location.href = `/vendor/${item.id}`
      }
    }

    if (e.key === 'Escape') {
      setShowResults(false)
      setActiveItem(null)
    }
  }

  const highlightMatch = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className='text-[#10b5cb] font-semibold'>
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

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
        <div className='flex-1 px-6 hidden md:block' ref={searchRef}>
          <div className='relative'>
            <Search
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />

            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Search products or vendors...'
              className='w-full rounded-md py-2 pl-10 pr-4 border ring-1 ring-[#55b8c5] focus:ring-2 focus:ring-[#10b5cb] outline-none'
            />

            {/* Results */}
            {showResults &&
              (results.products.length > 0 || results.vendors.length > 0) && (
                <div className='absolute top-full left-0 w-full bg-white border rounded-md shadow-lg mt-2 z-50 max-h-80 overflow-y-auto'>
                  {/* Products */}
                  {results.products.length > 0 && (
                    <>
                      <div className='px-3 py-1 text-xs text-gray-400'>
                        Products
                      </div>
                      {results.products.map((p, i) => {
                        const isActive =
                          activeItem?.type === 'product' &&
                          activeItem.index === i

                        return (
                          <Link
                            key={p.id}
                            href={`/products/${p.id}`}
                            className={`block px-4 py-2 ${
                              isActive ? 'bg-[#10b5cb]/10' : 'hover:bg-gray-50'
                            }`}
                          >
                            {highlightMatch(p.name, search)}
                          </Link>
                        )
                      })}
                    </>
                  )}

                  {/* Vendors */}
                  {results.vendors.length > 0 && (
                    <>
                      <div className='px-3 py-1 text-xs text-gray-400'>
                        Vendors
                      </div>
                      {results.vendors.map((v, i) => {
                        const isActive =
                          activeItem?.type === 'vendor' &&
                          activeItem.index === i

                        return (
                          <Link
                            key={v.id}
                            href={`/vendor/${v.id}`}
                            className={`block px-4 py-2 ${
                              isActive ? 'bg-[#10b5cb]/10' : 'hover:bg-gray-50'
                            }`}
                          >
                            {highlightMatch(v.store_name, search)}
                          </Link>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Right Side */}
        <div className='flex items-center gap-6'>
          <LanguageSwitcher />

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
              <Link href='/cart' className='hover:text-[#10b5cb]'>
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
                      <span className='text-yellow-500'>
                        ⏳ Pending Approval
                      </span>
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
            </>
          )}
        </div>
      </div>
    </header>
  )
}
