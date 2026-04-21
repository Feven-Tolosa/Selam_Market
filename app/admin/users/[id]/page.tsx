'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'

type User = {
  id: string
  email: string
  role: string
  created_at: string
}

type Vendor = {
  user_id: string
  store_name: string
  subscription_status: string
  trial_start: string
  trial_end: string
  message: string
}

export default function UserDetailPage() {
  const { id } = useParams()

  const [user, setUser] = useState<User | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)

  const fetchData = async () => {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (userError) toast.error(userError.message)

    const { data: vendorData } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', id)
      .maybeSingle()

    setUser(userData)
    setVendor(vendorData)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (!user) return <p className='p-10'>Loading user...</p>

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-[#10b5cb]'>User Details</h1>

      {/* 👤 USER INFO */}
      <div className='bg-white p-4 rounded shadow mb-6'>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Created:</strong>{' '}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* 🏪 VENDOR INFO */}
      {vendor ? (
        <div className='bg-white p-4 rounded shadow'>
          <h2 className='text-xl font-bold mb-2'>Vendor Info</h2>

          <p>
            <strong>Store:</strong> {vendor.store_name}
          </p>
          <p>
            <strong>Status:</strong> {vendor.subscription_status}
          </p>
          <p>
            <strong>Trial Start:</strong> {vendor.trial_start}
          </p>
          <p>
            <strong>Trial End:</strong> {vendor.trial_end}
          </p>

          {vendor.message && (
            <p className='mt-3 text-yellow-700'>{vendor.message}</p>
          )}
        </div>
      ) : (
        <p className='text-gray-500'>No vendor profile</p>
      )}
    </div>
  )
}
