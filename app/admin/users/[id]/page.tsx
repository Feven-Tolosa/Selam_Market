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
  is_active: boolean
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
  const { id } = useParams<{ id: string }>()

  const [user, setUser] = useState<User | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)

  const fetchData = async () => {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    const { data: vendorData } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', id)
      .maybeSingle()

    setUser(userData)
    setVendor(vendorData)
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const toggleStatus = async () => {
    if (!user) return

    const newStatus = !user.is_active

    const { error } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(newStatus ? 'User reactivated' : 'User blocked')
    fetchData()
  }

  if (!user) return <div className='p-10'>Loading...</div>

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-2xl font-bold mb-4'>User Detail</h1>

      <div className='bg-white p-5 rounded shadow'>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>

        <p>
          Status:{' '}
          <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
            {user.is_active ? 'active' : 'blocked'}
          </span>
        </p>

        <button
          onClick={toggleStatus}
          className={`mt-4 px-4 py-2 text-white rounded ${
            user.is_active ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {user.is_active ? 'Block User' : 'Reactivate User'}
        </button>
      </div>

      {vendor && (
        <div className='mt-6 bg-white p-5 rounded shadow'>
          <h2 className='font-bold mb-2'>Vendor Info</h2>
          <p>{vendor.store_name}</p>
          <p>{vendor.subscription_status}</p>
        </div>
      )}
    </div>
  )
}
