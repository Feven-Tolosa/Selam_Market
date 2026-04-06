'use client'

import { Store, Upload, Camera } from 'lucide-react'
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
  const [licenseFile, setLicenseFile] = useState<File | null>(null)

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) {
        toast.error('You must be logged in')
        return
      }
      setUserId(data.user.id)
    }
    getUser()
  }, [])

  // Realtime approval listener
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
          const newRequest = payload.new as VendorRequestType | null

          if (!newRequest) return

          if (newRequest.status === 'approved') {
            toast.success('Approved!')
            router.push('/vendor/profile/create')
          } else if (newRequest.status === 'rejected') {
            toast.error('Rejected')
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router])

  async function uploadLicense(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('vendor-licenses')
      .upload(fileName, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('vendor-licenses')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!userId) {
      toast.error('User not logged in')
      return
    }

    if (!licenseFile) {
      toast.error('Please upload your business license')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const storeName = formData.get('storeName') as string
      const phone = formData.get('phone') as string
      const location = formData.get('location') as string
      const description = formData.get('description') as string

      // Upload license
      const licenseUrl = await uploadLicense(licenseFile)

      const { error } = await supabase.from('vendor_requests').insert({
        user_id: userId,
        store_name: storeName,
        phone,
        location,
        description,
        license_url: licenseUrl,
        status: 'pending',
      })

      if (error) throw error

      toast.success('Request submitted!')
      router.push('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='h-auto w-full bg-gray-50 flex justify-center p-2'>
      <div className='w-full max-w-3xl bg-white border rounded-xl shadow-lg p-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='flex justify-center mb-4'>
            <div className='bg-[#10b5cb]/10 p-4 rounded-full'>
              <Store className='text-[#10b5cb]' size={32} />
            </div>
          </div>
          <h1 className='text-2xl font-semibold'>Become a Vendor</h1>
          <p className='text-gray-500'>Register your business</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Inputs */}
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <label className='text-sm text-gray-600'>Business Name</label>
              <input
                required
                name='storeName'
                type='text'
                placeholder='Your shop name'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
              <label className='text-sm text-gray-600'>Contact Info</label>
              <input
                name='phone'
                required
                placeholder='+251...'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
              <label className='text-sm text-gray-600'>Location</label>
              <input
                name='location'
                required
                placeholder='City / Area'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            <div className='space-y-4'>
              <label className='text-sm text-gray-600'>Description</label>
              <textarea
                name='description'
                required
                placeholder='Tell us about your business'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>
          </div>

          {/* LICENSE UPLOAD */}
          <div>
            <label className='text-sm text-gray-600 mb-2 block'>
              Business License (Scan or Upload)
            </label>

            <div className='border-2 border-dashed rounded-lg p-4 text-center'>
              <input
                type='file'
                accept='image/*,.pdf'
                capture='environment'
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setLicenseFile(e.target.files[0])
                  }
                }}
                className='hidden'
                id='licenseUpload'
              />

              <label
                htmlFor='licenseUpload'
                className='cursor-pointer flex flex-col items-center gap-2'
              >
                <Upload />
                <span className='text-sm text-gray-500'>
                  Click to upload or scan
                </span>
                <span className='text-xs text-gray-400'>JPG, PNG, or PDF</span>
              </label>

              {licenseFile && (
                <p className='text-sm text-green-600 mt-2'>
                  ✅ {licenseFile.name}
                </p>
              )}
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-[#10b5cb] text-white py-3 rounded-md'
          >
            {loading ? 'Submitting...' : 'Request Vendor Account'}
          </button>
        </form>
      </div>
    </main>
  )
}
