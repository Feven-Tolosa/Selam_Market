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
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)

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
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <div className='p-10 text-gray-500'>Loading user profile...</div>
  }

  if (!user) {
    return <div className='p-10 text-red-500'>User not found</div>
  }

  // 🎨 badge styles
  const roleColor =
    user.role === 'admin'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'

  const statusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'trial':
        return 'bg-yellow-100 text-yellow-700'
      case 'expired':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>User Profile</h1>
        <p className='text-gray-500 text-sm'>
          Detailed account and vendor information
        </p>
      </div>

      {/* GRID */}
      <div className='grid lg:grid-cols-3 gap-6'>
        {/* 👤 USER CARD */}
        <div className='bg-white rounded-xl shadow-sm p-5'>
          <h2 className='text-lg font-semibold mb-4'>User Info</h2>

          <div className='space-y-3 text-sm'>
            <div>
              <p className='text-gray-500'>Email</p>
              <p className='font-medium'>{user.email}</p>
            </div>

            <div>
              <p className='text-gray-500'>Role</p>
              <span className={`px-2 py-1 rounded text-xs ${roleColor}`}>
                {user.role}
              </span>
            </div>

            <div>
              <p className='text-gray-500'>Joined</p>
              <p className='font-medium'>
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* 🏪 VENDOR CARD */}
        <div className='bg-white rounded-xl shadow-sm p-5 lg:col-span-2'>
          <h2 className='text-lg font-semibold mb-4'>Vendor Info</h2>

          {vendor ? (
            <div className='space-y-4 text-sm'>
              <div className='flex items-center justify-between'>
                <p className='text-gray-500'>Store Name</p>
                <p className='font-medium'>{vendor.store_name}</p>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-gray-500'>Status</p>
                <span
                  className={`px-2 py-1 rounded text-xs ${statusColor(vendor.subscription_status)}`}
                >
                  {vendor.subscription_status}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-gray-500'>Trial Start</p>
                <p>
                  {vendor.trial_start
                    ? new Date(vendor.trial_start).toLocaleDateString()
                    : '-'}
                </p>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-gray-500'>Trial End</p>
                <p>
                  {vendor.trial_end
                    ? new Date(vendor.trial_end).toLocaleDateString()
                    : '-'}
                </p>
              </div>

              {/* Message box */}
              {vendor.message && (
                <div className='mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800'>
                  {vendor.message}
                </div>
              )}
            </div>
          ) : (
            <div className='text-gray-500 text-sm'>
              This user is not a vendor yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
