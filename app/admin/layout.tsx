'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return router.push('/login')

      // check role in users table
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userData?.role !== 'admin') {
        router.push('/') // redirect non-admins
      } else {
        setIsAdmin(true)
      }
    }
    checkAdmin()
  }, [router])

  if (!isAdmin) return <p className='p-10'>Checking admin privileges...</p>

  return (
    <div className='flex min-h-screen bg-[#f9f9f9]'>
      <AdminSidebar />
      <div className='flex-1 flex flex-col'>
        <main className='p-8 overflow-auto'>{children}</main>
      </div>
    </div>
  )
}
