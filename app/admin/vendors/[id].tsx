'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type VendorRequest = {
  id: string
  store_name: string
  store_description: string
  user_id: string
  phone: string
  location: string
  license_url: string
  status: string
  created_at: string
}

export default function VendorDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorRequest | null>(null)
  const [recentVendors, setRecentVendors] = useState<VendorRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVendor = async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('vendor_requests')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      toast.error(error.message)
      router.back()
      return
    }
    setVendor(data)
  }

  const fetchRecent = async () => {
    const { data } = await supabase
      .from('vendor_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    setRecentVendors(data || [])
  }

  useEffect(() => {
    fetchVendor()
    fetchRecent()
    setLoading(false)
  }, [id])

  if (loading) return <p className='p-10'>Loading...</p>
  if (!vendor) return <p className='p-10'>Vendor not found.</p>

  const updateStatus = async (status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('vendor_requests')
      .update({ status })
      .eq('id', vendor.id)
    if (error) return toast.error(error.message)
    toast.success(`Vendor ${status}`)
    fetchVendor()
    fetchRecent()
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <button
        onClick={() => router.back()}
        className='mb-4 text-blue-500 underline'
      >
        &larr; Back
      </button>

      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h1 className='text-2xl font-bold text-[#10b5cb] mb-2'>
          {vendor.store_name}
        </h1>
        <p className='text-gray-600 mb-2'>
          <strong>Status:</strong> {vendor.status}
        </p>
        <p className='mb-1'>
          <strong>Description:</strong> {vendor.store_description}
        </p>
        <p className='mb-1'>
          <strong>Phone:</strong> {vendor.phone}
        </p>
        <p className='mb-1'>
          <strong>Location:</strong> {vendor.location}
        </p>
        <p className='mb-1'>
          <strong>User ID:</strong> {vendor.user_id}
        </p>
        <p className='mb-1'>
          <strong>Submitted:</strong>{' '}
          {new Date(vendor.created_at).toLocaleString()}
        </p>
        {vendor.license_url && (
          <p className='mt-3'>
            <strong>Business License:</strong>{' '}
            <a
              href={vendor.license_url}
              target='_blank'
              className='text-blue-500 underline'
            >
              View License
            </a>
          </p>
        )}

        {vendor.status === 'pending' && (
          <div className='mt-4 flex gap-2'>
            <button
              onClick={() => updateStatus('approved')}
              className='bg-green-500 text-white px-3 py-1 rounded hover:opacity-90'
            >
              Approve
            </button>
            <button
              onClick={() => updateStatus('rejected')}
              className='bg-red-500 text-white px-3 py-1 rounded hover:opacity-90'
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Recent vendors */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Last 3 Vendor Requests</h2>
        <table className='w-full text-left border'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='px-4 py-2 border'>Store Name</th>
              <th className='px-4 py-2 border'>Status</th>
              <th className='px-4 py-2 border'>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {recentVendors.map((v) => (
              <tr key={v.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2 border'>{v.store_name}</td>
                <td className='px-4 py-2 border'>{v.status}</td>
                <td className='px-4 py-2 border'>
                  {new Date(v.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
