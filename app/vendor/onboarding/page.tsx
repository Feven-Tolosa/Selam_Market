'use client'

import { Store } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type VendorRequestType = {
  id: string
  store_name: string
  user_id: string
  status: string
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
          const newRequest = payload.new as VendorRequestType
          if (newRequest?.status === 'approved') {
            toast.success('Your vendor request has been approved!')
            router.push('/vendor/profile/create')
          } else if (newRequest?.status === 'rejected') {
            toast.error('Your vendor request has been rejected')
          }
        },
      )
      .subscribe()

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
    router.push('/')
  }

  return (
    <main className='max-h-screen w-full bg-gray-50 flex justify-center items-start py-4 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-3xl bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-10'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='bg-[#10b5cb]/10 p-4 rounded-full'>
              <Store className='text-[#10b5cb]' size={32} />
            </div>
          </div>
          <h1 className='text-2xl sm:text-3xl font-semibold text-gray-800'>
            Become a Vendor
          </h1>
          <p className='text-gray-500 text-sm sm:text-base mt-1'>
            Create your store and start selling products
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
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
            </div>

            <div>
              <label className='text-sm text-gray-600'>
                Business Description
              </label>
              <textarea
                required
                name='description'
                rows={7}
                placeholder='Describe your business...'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb] resize-none'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-[#10b5cb] hover:bg-[#0e9fb3] text-white py-3 rounded-md font-medium transition'
          >
            {loading ? 'Submitting...' : 'Request Vendor Account'}
          </button>
        </form>
      </div>
    </main>
  )
}
