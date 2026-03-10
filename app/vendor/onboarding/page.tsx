import { Store } from 'lucide-react'

import { supabase } from '@/lib/supabaseClient'
import { redirect } from 'next/navigation'

export default async function VendorOnboarding() {
  //*********Todo: vendor_approved************

  // const { data } = await supabase.auth.getUser()
  // const user = data.user
  // if (!user) {
  //   redirect('/login')
  // }

  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('is_vendor_approved')
  //   .eq('id', user.id)
  //   .single()

  // if (!profile?.is_vendor_approved) {
  //   return (
  //     <>
  //       <div className='p-10 text-center'>
  //         <h1 className='text-xl font-semibold'>Vendor access not approved</h1>
  //         <p className='text-gray-500 mt-2'>
  //           Please wait until the admin approves your vendor account.
  //         </p>
  //       </div>
  //     </>
  //   )
  // }

  // *********on userData.user, first fetch the authenticated user And Save Vendor Data********

  // const { data: userData } = await supabase.auth.getUser()

  // await supabase.from('vendors').insert({
  //   user_id: userData.user.id,
  //   business_name,
  //   phone,
  //   location,
  //   description,
  // })

  return (
    <>
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
          <form className='space-y-5'>
            {/* Business Name */}
            <div>
              <label className='text-sm text-gray-600'>Business Name</label>
              <input
                type='text'
                placeholder='Your shop name'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            {/* Phone */}
            <div>
              <label className='text-sm text-gray-600'>Phone Number</label>
              <input
                type='text'
                placeholder='+251...'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            {/* Location */}
            <div>
              <label className='text-sm text-gray-600'>Location</label>
              <input
                type='text'
                placeholder='City / Area'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            {/* Description */}
            <div>
              <label className='text-sm text-gray-600'>
                Business Description
              </label>
              <textarea
                rows={4}
                placeholder='Describe your business...'
                className='w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10b5cb]'
              />
            </div>

            {/* Submit */}
            <button
              type='submit'
              className='w-full bg-[#10b5cb] hover:bg-[#0e9fb3] text-white py-2 rounded-md font-medium transition'
            >
              Create Vendor Account
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
