'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type VendorRequest = {
  id: string
  store_name: string
  store_description: string
  user_id: string
  status: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>([])
  const [userEmail, setUserEmail] = useState('Admin')

  // Fetch vendor requests
  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendor_requests')
      .select('*')
      .order('created_at', { ascending: false }) // optional: newest first

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setVendorRequests(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData() // call fetchData properly

    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserEmail(data.user.email || 'Admin')
    }
    getUser()
  }, [])

  // Approve / Reject Vendor Request
  const handleVendorRequest = async (id: string, action: string) => {
    const { error } = await supabase
      .from('vendor_requests')
      .update({ status: action })
      .eq('id', id)

    if (error) return toast.error(error.message)
    toast.success(`Vendor request ${action}`)
    fetchData()
  }

  if (loading) return <p className='p-10'>Loading...</p>

  return (
    <div className=' bg-[#f9f9f9] min-h-screen'>
      <main className='p-4 overflow-auto'>
        <h1 className='text-3xl font-bold text-[#10b5cb] mb-6'>
          Vendor Requests
        </h1>

        <table className='w-full border rounded-md overflow-hidden'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='px-4 py-2 border'>Store Name</th>
              <th className='px-4 py-2 border'>User ID</th>
              <th className='px-4 py-2 border'>Status</th>
              <th className='px-4 py-2 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendorRequests.map((r) => (
              <tr key={r.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2 border'>{r.store_name}</td>
                <td className='px-4 py-2 border'>{r.user_id}</td>
                <td className='px-4 py-2 border'>{r.status}</td>
                <td className='px-4 py-2 border flex gap-2'>
                  {r.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleVendorRequest(r.id, 'approved')}
                        className='bg-green-500 text-white px-2 py-1 rounded hover:opacity-90'
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVendorRequest(r.id, 'rejected')}
                        className='bg-red-500 text-white px-2 py-1 rounded hover:opacity-90'
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
