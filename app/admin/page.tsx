'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>([])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendor_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setVendorRequests(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <p className='p-10'>Loading vendor requests...</p>

  // Categorize vendors
  const pendingVendors = vendorRequests.filter((v) => v.status === 'pending')
  const approvedVendors = vendorRequests.filter((v) => v.status === 'approved')
  const rejectedVendors = vendorRequests.filter((v) => v.status === 'rejected')

  const renderVendorCard = (vendor: VendorRequest) => (
    <div
      key={vendor.id}
      className='relative bg-white rounded-lg shadow-md p-4 group hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300 cursor-pointer'
    >
      <h2 className='text-lg font-bold mb-2'>{vendor.store_name}</h2>
      {/* View Details button (always visible) */}
      <Link
        href={`/admin/vendors/${vendor.id}`}
        className='block bg-[#10b5cb] text-white text-center py-2 rounded font-semibold'
      >
        View Details
      </Link>

      {/* Hover info card */}
      <div className='absolute top-6 left-4 right-4 mt-4 p-3 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 pointer-events-none overflow-auto'>
        <h3 className='font-semibold mb-1'>{vendor.store_name}</h3>
        <p className='text-sm text-gray-600 mb-1 line-clamp-2'>
          {vendor.store_description}
        </p>
        <p className='text-xs text-gray-500'>
          <strong>Phone:</strong> {vendor.phone}
        </p>
        <p className='text-xs text-gray-500'>
          <strong>Location:</strong> {vendor.location}
        </p>
        <p className='text-xs text-gray-500'>
          <strong>Status:</strong> {vendor.status}
        </p>
      </div>
    </div>
  )

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-[#10b5cb] mb-6'>
        Vendor Requests
      </h1>

      {/* Pending Vendors */}
      {pendingVendors.length > 0 && (
        <>
          <h2 className='text-xl font-semibold mb-4 text-gray-700'>
            Pending Vendors
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {pendingVendors.map(renderVendorCard)}
          </div>
        </>
      )}

      {/* Approved Vendors */}
      {approvedVendors.length > 0 && (
        <>
          <h2 className='text-xl font-semibold mb-4 text-gray-700'>
            Approved Vendors
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {approvedVendors.map(renderVendorCard)}
          </div>
        </>
      )}

      {/* Rejected Vendors */}
      {rejectedVendors.length > 0 && (
        <>
          <h2 className='text-xl font-semibold mb-4 text-gray-700'>
            Rejected Vendors
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {rejectedVendors.map(renderVendorCard)}
          </div>
        </>
      )}
    </div>
  )
}
