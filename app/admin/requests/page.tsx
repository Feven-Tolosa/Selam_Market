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

  // Helper for status badge color
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

  const renderVendorCard = (vendor: VendorRequest) => (
    <div
      key={vendor.id}
      className='relative bg-white rounded-lg shadow-md p-4 group hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-300 cursor-pointer'
    >
      <h4 className='font-bold text-lg mb-2'>{vendor.store_name}</h4>
      {/* View Details button */}
      <Link
        href={`/admin/vendors/${vendor.id}`}
        className='block bg-[#10b5cb] text-white text-center py-2 rounded font-semibold'
      >
        View Details
      </Link>

      {/* Hover info card */}
      <div className='absolute top-6 left-4 right-4 mt-4 p-3 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 pointer-events-none'>
        <div className='flex justify-between items-center mb-1'>
          <h3 className='font-semibold text-sm'>{vendor.store_name}</h3>
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(vendor.status)}`}
          >
            {vendor.status.toUpperCase()}
          </span>
        </div>
        <p className='text-xs text-gray-600 mb-1 line-clamp-2'>
          {vendor.store_description}
        </p>
        <p className='text-xs text-gray-500'>
          <strong>Phone:</strong> {vendor.phone}
        </p>
        <p className='text-xs text-gray-500'>
          <strong>Location:</strong> {vendor.location}
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
