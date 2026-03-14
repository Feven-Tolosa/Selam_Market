'use client'

import { Store } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type VendorRequestType = {
  status: string
  id: string
  store_name: string
  user_id: string
}

export default function VendorOnboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Get currently logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        toast.error('You must be logged in to create a vendor account')
        return
      }
      setUserId(data.user.id)
    }
    getUser()
  }, [])

  // Real-time subscription for vendor approval
  useEffect(() => {
    if (!userId) return

    // Create a channel for vendor requests updates
    const channel = supabase.channel(`vendor-approval-${userId}`)

    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendor_requests',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<VendorRequestType>) => {
          if (payload.new.status === 'approved') {
            toast.success('Your vendor request has been approved!')
            router.push('/vendor/profile/create')
          } else if (payload.new.status === 'rejected') {
            toast.error('Your vendor request has been rejected')
          }
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId) {
      toast.error('User not logged in')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const storeName = formData.get('storeName') as string
    const phone = formData.get('phone') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string

    // Insert vendor request
    const { error } = await supabase.from('vendor_requests').insert({
      user_id: userId,
      store_name: storeName,
      phone,
      location,
      description,
      status: 'pending',
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Vendor request submitted successfully!')
    setLoading(false)
    router.push('/vendor/dashboard')
  }

  return (
    <main className='min-h-screen bg-white flex justify-center px-4 py-12'>
      <div className='w-full max-w-2xl border rounded-xl shadow-sm p-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='bg-[#10b5cb]/10 p-3 rounded-full'>
              <Store className='text-[#10b5cb]' size={28} />
            </div>
          </div>
          <h1 className='text-2xl font-semibold text-gray-800'>
            Become a Vendor
          </h1>
          <p className='text-gray-500 text-sm mt-1'>
            Create your store and start selling products
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className='text-sm text-gray-600'>Business Name</label>
            <input
              required
              name='storeName'
              type='text'
              placeholder='Your shop name'
              className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
            />
          </div>

          <div>
            <label className='text-sm text-gray-600'>Phone Number</label>
            <input
              required
              name='phone'
              type='text'
              placeholder='+251...'
              className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
            />
          </div>

          <div>
            <label className='text-sm text-gray-600'>Location</label>
            <input
              required
              name='location'
              type='text'
              placeholder='City / Area'
              className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
            />
          </div>

          <div>
            <label className='text-sm text-gray-600'>
              Business Description
            </label>
            <textarea
              required
              name='description'
              rows={4}
              placeholder='Describe your business...'
              className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-[#10b5cb] hover:bg-[#0e9fb3] text-white py-2 rounded-md font-medium transition'
          >
            {loading ? 'Submitting...' : 'Request Vendor Account'}
          </button>
        </form>
      </div>
    </main>
  )
}
