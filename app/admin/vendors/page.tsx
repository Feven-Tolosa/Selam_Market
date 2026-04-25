'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type Vendor = {
  id: string
  store_name: string
  user_id: string
  trial_start: string | null
  trial_end: string | null
  subscription_status: string
  is_active: boolean
  message: string | null
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])

  const fetchData = async () => {
    const { data, error } = await supabase.from('vendors').select('*')

    if (error) return toast.error(error.message)

    setVendors(data || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ FORCE END TRIAL (admin override)
  const endTrial = async (vendor: Vendor) => {
    const { error } = await supabase
      .from('vendors')
      .update({
        subscription_status: 'expired',
        is_active: false, // 🔥 BLOCK vendor
        message: 'Your trial has ended. Please subscribe to continue.',
      })
      .eq('id', vendor.id)

    if (error) return toast.error(error.message)

    toast.success('Vendor access revoked')
    fetchData()
  }

  // ✅ ACTIVATE after payment (future use)
  const activateVendor = async (vendor: Vendor) => {
    const { error } = await supabase
      .from('vendors')
      .update({
        subscription_status: 'active',
        is_active: true,
        message: 'Subscription active ✅',
      })
      .eq('id', vendor.id)

    if (error) return toast.error(error.message)

    toast.success('Vendor activated')
    fetchData()
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'trial':
        return 'bg-blue-100 text-blue-700'
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'expired':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-[#10b5cb]'>
        Vendors Management
      </h1>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className='bg-white p-4 rounded shadow hover:shadow-lg'
          >
            <h3 className='font-bold'>{vendor.store_name}</h3>

            <p className='text-sm mt-1'>
              Status:{' '}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(
                  vendor.subscription_status,
                )}`}
              >
                {vendor.subscription_status}
              </span>
            </p>

            <p className='text-xs text-gray-500 mt-1'>
              Trial Ends:{' '}
              {vendor.trial_end
                ? new Date(vendor.trial_end).toLocaleDateString()
                : 'N/A'}
            </p>

            <p className='text-xs mt-1'>
              Active:{' '}
              <strong
                className={vendor.is_active ? 'text-green-600' : 'text-red-600'}
              >
                {vendor.is_active ? 'Yes' : 'No'}
              </strong>
            </p>

            {vendor.message && (
              <p className='text-xs mt-2 text-yellow-700'>{vendor.message}</p>
            )}

            <div className='flex gap-2 mt-3'>
              {/* ❌ Removed Start Trial */}

              {/* ✅ Manual expire */}
              {vendor.subscription_status === 'trial' && (
                <button
                  onClick={() => endTrial(vendor)}
                  className='bg-red-500 text-white px-3 py-1 rounded'
                >
                  Force End
                </button>
              )}

              {/* ✅ Activate after payment */}
              {vendor.subscription_status === 'expired' && (
                <button
                  onClick={() => activateVendor(vendor)}
                  className='bg-green-500 text-white px-3 py-1 rounded'
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
