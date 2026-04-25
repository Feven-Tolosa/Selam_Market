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

  // ✅ APPROVE vendor + auto start trial
  const approveVendor = async () => {
    if (!vendor) return

    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + 7)

    // 1. Update request status
    const { error: requestError } = await supabase
      .from('vendor_requests')
      .update({ status: 'approved' })
      .eq('id', vendor.id)

    if (requestError) return toast.error(requestError.message)

    // 2. Create/update vendor with trial
    const { error: vendorError } = await supabase.from('vendors').upsert({
      user_id: vendor.user_id,
      store_name: vendor.store_name,

      trial_start: start.toISOString(),
      trial_end: end.toISOString(),
      subscription_status: 'trial',
      is_active: true,
      message: 'Your free trial has started 🎉',
    })

    if (vendorError) return toast.error(vendorError.message)

    toast.success('Vendor approved & trial started 🚀')

    fetchVendor()
    fetchRecent()
  }

  // ✅ REMOVE vendor safely
  const removeVendor = async () => {
    if (!confirm('Are you sure you want to remove this vendor?')) return
    if (!vendor) return

    // 1. Get products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendor.user_id)

    if (prodError) return toast.error(prodError.message)

    const productIds = products?.map((p) => p.id) || []

    if (productIds.length > 0) {
      await supabase.from('reviews').delete().in('product_id', productIds)
      await supabase.from('cart_items').delete().in('product_id', productIds)

      const { error: deleteProductsError } = await supabase
        .from('products')
        .delete()
        .eq('vendor_id', vendor.user_id)

      if (deleteProductsError) return toast.error(deleteProductsError.message)
    }

    // Delete vendor
    const { error: deleteVendorError } = await supabase
      .from('vendors')
      .delete()
      .eq('user_id', vendor.user_id)

    if (deleteVendorError) return toast.error(deleteVendorError.message)

    // Update request
    await supabase
      .from('vendor_requests')
      .update({ status: 'rejected' })
      .eq('id', vendor.id)

    toast.success('Vendor removed')

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
    setLoading(false)
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
  }, [id])

  const updateStatus = async (status: 'approved' | 'rejected') => {
    if (!vendor) return

    const { error } = await supabase
      .from('vendor_requests')
      .update({ status })
      .eq('id', vendor.id)

    if (error) return toast.error(error.message)

    toast.success(`Vendor ${status}`)

    fetchVendor()
    fetchRecent()
  }

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

  if (loading) return <p className='p-10'>Loading...</p>
  if (!vendor) return <p className='p-10'>Vendor not found.</p>

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <button
        onClick={() => router.back()}
        className='mb-4 text-blue-500 underline'
      >
        ← Back
      </button>

      {/* Vendor Card */}
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

        <p>
          <strong>Description:</strong> {vendor.store_description}
        </p>
        <p>
          <strong>Phone:</strong> {vendor.phone}
        </p>
        <p>
          <strong>Location:</strong> {vendor.location}
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
          {vendor.status === 'pending' && (
            <>
              <button
                onClick={approveVendor}
                className='bg-green-500 text-white px-3 py-1 rounded'
              >
                Approve
              </button>

              <button
                onClick={() => updateStatus('rejected')}
                className='bg-red-500 text-white px-3 py-1 rounded'
              >
                Reject
              </button>
            </>
          )}

          {vendor.status === 'rejected' && (
            <button
              onClick={approveVendor}
              className='bg-blue-500 text-white px-3 py-1 rounded'
            >
              Accept Again
            </button>
          )}

          {vendor.status === 'approved' && (
            <button
              onClick={removeVendor}
              className='bg-red-600 text-white px-3 py-1 rounded'
            >
              Remove Vendor
            </button>
          )}
        </div>
      </div>

      {/* Recent */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Last 3 Vendor Requests</h2>

        <table className='w-full border'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-2 border'>Store</th>
              <th className='p-2 border'>Status</th>
              <th className='p-2 border'>Date</th>
            </tr>
          </thead>

          <tbody>
            {recentVendors.map((v) => (
              <tr key={v.id}>
                <td className='p-2 border'>{v.store_name}</td>
                <td className='p-2 border'>{v.status}</td>
                <td className='p-2 border'>
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
        className='fixed inset-0 flex items-center justify-center p-4'
      >
        <div className='fixed inset-0 bg-black/50' />

        <Dialog.Panel className='bg-white p-6 rounded z-10 max-w-2xl w-full'>
          {vendor.license_url?.endsWith('.pdf') ? (
            <iframe src={vendor.license_url} className='w-full h-96' />
          ) : (
            <img src={vendor.license_url} className='w-full' />
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
