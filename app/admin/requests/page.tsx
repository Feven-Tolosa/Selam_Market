'use client'

import { useEffect, useMemo, useState } from 'react'
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

  // ✅ Fetch Data (refined)
  const fetchData = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('vendor_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(error.message)
      console.error(error)
      setLoading(false)
      return
    }

    // ✅ Remove duplicate requests per user (frontend safety)
    const uniqueRequestsMap = new Map<string, VendorRequest>()

    for (const req of data || []) {
      if (!uniqueRequestsMap.has(req.user_id)) {
        uniqueRequestsMap.set(req.user_id, req)
      }
    }

    setVendorRequests(Array.from(uniqueRequestsMap.values()))
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ✅ Memoized categorization (performance improvement)
  const { pendingVendors, approvedVendors, rejectedVendors } = useMemo(() => {
    return {
      pendingVendors: vendorRequests.filter((v) => v.status === 'pending'),
      approvedVendors: vendorRequests.filter((v) => v.status === 'approved'),
      rejectedVendors: vendorRequests.filter((v) => v.status === 'rejected'),
    }
  }, [vendorRequests])

  // ✅ Status color helper
  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400 text-yellow-900'
      case 'approved':
        return 'bg-green-400 text-green-900'
      case 'rejected':
        return 'bg-red-400 text-red-900'
      default:
        return 'bg-gray-300 text-gray-800'
    }
  }

  // ✅ Card Renderer (cleaned)
  const renderVendorCard = (vendor: VendorRequest) => (
    <Link
      href={`/admin/vendors/${vendor.id}`}
      key={vendor.id}
      className='relative bg-white rounded-lg shadow-md p-4 group hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300 cursor-pointer'
    >
      <h4 className='font-bold text-lg mb-2 line-clamp-1'>
        {vendor.store_name}
      </h4>

      <div className='block bg-[#10b5cb] text-white text-center py-2 rounded font-semibold'>
        View Details
      </div>

      {/* Hover Info */}
      <div className='absolute top-6 left-4 right-4 mt-4 p-3 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 pointer-events-none'>
        <div className='flex justify-between items-center mb-1'>
          <h3 className='font-semibold text-sm truncate'>
            {vendor.store_name}
          </h3>

          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(
              vendor.status,
            )}`}
          >
            {vendor.status.toUpperCase()}
          </span>
        </div>

        <p className='text-xs text-gray-600 mb-1 line-clamp-2'>
          {vendor.store_description}
        </p>

        <p className='text-xs text-gray-500'>
          <strong>Phone:</strong> {vendor.phone || 'N/A'}
        </p>

        <p className='text-xs text-gray-500'>
          <strong>Location:</strong> {vendor.location || 'N/A'}
        </p>
      </div>
    </Link>
  )

  if (loading) {
    return <p className='p-10'>Loading vendor requests...</p>
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-[#10b5cb] mb-6'>
        Vendor Requests
      </h1>

      {/* Pending */}
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

      {/* Approved */}
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

      {/* Rejected */}
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
