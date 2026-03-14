'use client'

import { User } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminHeader({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className='flex justify-end items-center gap-4 p-4 border-b bg-white'>
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
