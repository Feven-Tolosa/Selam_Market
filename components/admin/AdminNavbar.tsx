'use client'

import { User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminNavbar() {
  const [userEmail, setUserEmail] = useState('Admin')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserEmail(data.user.email || 'Admin')
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className='bg-white border-b flex justify-end items-center px-6 py-4 sticky top-0 z-50'>
      <div
        className='relative'
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button className='flex items-center gap-2 hover:text-[#10b5cb] transition'>
          <User size={22} />
          {userEmail}
        </button>

        {open && (
          <div className='absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md'>
            <button
              onClick={handleLogout}
              className='w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500'
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
