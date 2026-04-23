'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type Vendor = {
  id: string
  store_name: string
  is_approved: boolean
}

export default function VendorsTable() {
  const [vendors, setVendors] = useState<Vendor[]>([])

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, store_name, is_approved')

    setVendors(data ?? [])
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const toggleApproval = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('vendors')
      .update({ is_approved: !current })
      .eq('id', id)

    if (error) {
      toast.error('Update failed')
    } else {
      toast.success('Updated')
      fetchVendors()
    }
  }

  return (
    <div className='bg-white p-4 rounded-xl shadow'>
      <h2 className='font-semibold mb-4'>Vendors</h2>

      <div className='space-y-2'>
        {vendors.map((v) => (
          <div
            key={v.id}
            className='flex justify-between items-center border p-2 rounded'
          >
            <span>{v.store_name}</span>

            <button
              onClick={() => toggleApproval(v.id, v.is_approved)}
              className={`px-3 py-1 rounded text-white ${
                v.is_approved ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {v.is_approved ? 'Revoke' : 'Approve'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
