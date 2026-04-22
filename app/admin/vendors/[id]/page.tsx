'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Dialog } from '@headlessui/react'

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
  const [licenseOpen, setLicenseOpen] = useState(false)

  // APPROVE or RE-APPROVE vendor
  const approveVendor = async () => {
    if (!vendor) return

    // 1. Insert into vendors table
    const { error: insertError } = await supabase.from('vendors').insert({
      user_id: vendor.user_id,
      store_name: vendor.store_name,
      description: vendor.store_description,
      phone: vendor.phone,
      location: vendor.location,
    })

    if (insertError) {
      // Avoid duplicate insert crash
      if (!insertError.message.includes('duplicate')) {
        return toast.error(insertError.message)
      }
    }

    // 2. Update request status
    const { error } = await supabase
      .from('vendor_requests')
      .update({ status: 'approved' })
      .eq('id', vendor.id)

    if (error) return toast.error(error.message)

    toast.success('Vendor approved')
    fetchVendor()
    fetchRecent()
  }

  // REMOVE approved vendor
  const removeVendor = async () => {
    if (!confirm('Are you sure you want to remove this vendor?')) return
    if (!vendor) return

    // 1. Get vendor products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendor.user_id)

    if (prodError) return toast.error(prodError.message)

    const productIds = products?.map((p) => p.id) || []

    if (productIds.length > 0) {
      // 2. Delete cart items referencing those products
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .in('product_id', productIds)

      if (cartError) return toast.error(cartError.message)

      // 3. Delete products
      const { error: deleteProductsError } = await supabase
        .from('products')
        .delete()
        .eq('vendor_id', vendor.user_id)

      if (deleteProductsError) return toast.error(deleteProductsError.message)
    }

    // 4. Delete vendor
    const { error: deleteVendorError } = await supabase
      .from('vendors')
      .delete()
      .eq('user_id', vendor.user_id)

    if (deleteVendorError) return toast.error(deleteVendorError.message)

    // 5. Update request status
    const { error: updateError } = await supabase
      .from('vendor_requests')
      .update({ status: 'rejected' })
      .eq('id', vendor.id)

    if (updateError) return toast.error(updateError.message)

    toast.success('Vendor removed successfully')
    fetchVendor()
    fetchRecent()
  }

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

  // Status badge helper
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

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <button
        onClick={() => router.back()}
        className='mb-4 text-blue-500 underline'
      >
        &larr; Back
      </button>

      {/* Vendor Info Card */}
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <div className='flex justify-between items-center mb-3'>
          <h1 className='text-2xl font-bold text-[#10b5cb]'>
            {vendor.store_name}
          </h1>
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${statusColor(vendor.status)}`}
          >
            {vendor.status.toUpperCase()}
          </span>
        </div>
        <p className='mb-2'>
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
          <button
            onClick={() => setLicenseOpen(true)}
            className='mt-3 text-blue-500 underline'
          >
            View License
          </button>
        )}

        <div className='mt-4 flex gap-2'>
          {/* Pending */}
          {vendor.status === 'pending' && (
            <>
              <button
                onClick={approveVendor}
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
            </>
          )}

          {/* Re-accept rejected */}
          {vendor.status === 'rejected' && (
            <button
              onClick={approveVendor}
              className='bg-blue-500 text-white px-3 py-1 rounded hover:opacity-90'
            >
              Accept Again
            </button>
          )}

          {/* Remove approved */}
          {vendor.status === 'approved' && (
            <button
              onClick={removeVendor}
              className='bg-red-600 text-white px-3 py-1 rounded hover:opacity-90'
            >
              Remove Vendor
            </button>
          )}
        </div>
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
                <td className='px-4 py-2 border'>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(v.status)}`}
                  >
                    {v.status.toUpperCase()}
                  </span>
                </td>
                <td className='px-4 py-2 border'>
                  {new Date(v.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* License Modal */}
      <Dialog
        open={licenseOpen}
        onClose={() => setLicenseOpen(false)}
        className='fixed z-50 inset-0 overflow-y-auto flex items-center justify-center p-4'
      >
        <div
          className='fixed inset-0 bg-black bg-opacity-50'
          aria-hidden='true'
        />
        <Dialog.Panel className='bg-white rounded-lg p-6 z-10 w-full max-w-2xl'>
          <Dialog.Title className='text-xl font-bold mb-4'>
            Business License
          </Dialog.Title>
          {vendor.license_url?.endsWith('.pdf') ? (
            <iframe
              src={vendor.license_url}
              className='w-full h-96'
              title='License PDF'
            />
          ) : (
            <img
              src={vendor.license_url!}
              alt='License'
              className='w-full max-h-96 object-contain'
            />
          )}
          <button
            onClick={() => setLicenseOpen(false)}
            className='mt-4 w-full bg-[#10b5cb] text-white py-2 rounded'
          >
            Close
          </button>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
