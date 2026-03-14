'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type UserType = { id: string; email?: string; role?: string }
type VendorRequest = {
  id: string
  store_name: string
  owner_id: string
  status: string
}
type VendorType = { id: string; store_name: string; owner_id: string }
type ProductType = {
  id: string
  name: string
  price: number
  vendor_id: string
}
type ReviewType = {
  id: string
  product_id: string
  rating: number
  comment: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserType[]>([])
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>([])
  const [vendors, setVendors] = useState<VendorType[]>([])
  const [products, setProducts] = useState<ProductType[]>([])
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [userEmail, setUserEmail] = useState('Admin')

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    const { data: userData } = await supabase.from('users').select('*')
    setUsers(userData || [])

    const { data: vendorReqData } = await supabase
      .from('vendor_requests')
      .select('*')
    setVendorRequests(vendorReqData || [])

    const { data: vendorData } = await supabase.from('vendors').select('*')
    setVendors(vendorData || [])

    const { data: productData } = await supabase.from('products').select('*')
    setProducts(productData || [])

    const { data: reviewData } = await supabase
      .from('vendor_reviews')
      .select('*')
    setReviews(reviewData || [])

    setLoading(false)
  }

  useEffect(() => {
    ;async () => await fetchData()

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

  // Delete functions
  const handleDelete = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Deleted successfully')
    fetchData()
  }

  if (loading) return <p className='p-10'>Loading...</p>

  return (
    <div className='flex bg-[#f9f9f9] min-h-screen'>
      <Sidebar active='Dashboard' />
      <div className='flex-1 flex flex-col'>
        <AdminHeader userEmail={userEmail} />

        <main className='p-8 overflow-auto'>
          <h1 className='text-3xl font-bold text-[#10b5cb] mb-6'>
            Dashboard Overview
          </h1>

          {/* Users Table */}
          <section className='mb-10'>
            <h2 className='text-xl font-semibold mb-2'>Users</h2>
            <table className='w-full border rounded-md overflow-hidden'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-4 py-2 border'>Email</th>
                  <th className='px-4 py-2 border'>Role</th>
                  <th className='px-4 py-2 border'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 border'>{u.email}</td>
                    <td className='px-4 py-2 border'>{u.role || 'user'}</td>
                    <td className='px-4 py-2 border'>
                      <button
                        onClick={() => handleDelete('users', u.id)}
                        className='bg-red-500 text-white px-2 py-1 rounded hover:opacity-90'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Vendor Requests */}
          <section className='mb-10'>
            <h2 className='text-xl font-semibold mb-2'>Vendor Requests</h2>
            <table className='w-full border rounded-md overflow-hidden'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-4 py-2 border'>Store Name</th>
                  <th className='px-4 py-2 border'>Owner ID</th>
                  <th className='px-4 py-2 border'>Status</th>
                  <th className='px-4 py-2 border'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorRequests.map((r) => (
                  <tr key={r.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 border'>{r.store_name}</td>
                    <td className='px-4 py-2 border'>{r.owner_id}</td>
                    <td className='px-4 py-2 border'>{r.status}</td>
                    <td className='px-4 py-2 border flex gap-2'>
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              handleVendorRequest(r.id, 'approved')
                            }
                            className='bg-green-500 text-white px-2 py-1 rounded hover:opacity-90'
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleVendorRequest(r.id, 'rejected')
                            }
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
          </section>

          {/* Vendors Table */}
          <section className='mb-10'>
            <h2 className='text-xl font-semibold mb-2'>Vendors</h2>
            <table className='w-full border rounded-md overflow-hidden'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-4 py-2 border'>Store Name</th>
                  <th className='px-4 py-2 border'>Owner ID</th>
                  <th className='px-4 py-2 border'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 border'>{v.store_name}</td>
                    <td className='px-4 py-2 border'>{v.owner_id}</td>
                    <td className='px-4 py-2 border'>
                      <button
                        onClick={() => handleDelete('vendors', v.id)}
                        className='bg-red-500 text-white px-2 py-1 rounded hover:opacity-90'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Products Table */}
          <section className='mb-10'>
            <h2 className='text-xl font-semibold mb-2'>Products</h2>
            <table className='w-full border rounded-md overflow-hidden'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-4 py-2 border'>Name</th>
                  <th className='px-4 py-2 border'>Price</th>
                  <th className='px-4 py-2 border'>Vendor ID</th>
                  <th className='px-4 py-2 border'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 border'>{p.name}</td>
                    <td className='px-4 py-2 border'>{p.price}</td>
                    <td className='px-4 py-2 border'>{p.vendor_id}</td>
                    <td className='px-4 py-2 border'>
                      <button
                        onClick={() => handleDelete('products', p.id)}
                        className='bg-red-500 text-white px-2 py-1 rounded hover:opacity-90'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Reviews Table */}
          <section className='mb-10'>
            <h2 className='text-xl font-semibold mb-2'>Reviews</h2>
            <table className='w-full border rounded-md overflow-hidden'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-4 py-2 border'>Product ID</th>
                  <th className='px-4 py-2 border'>Rating</th>
                  <th className='px-4 py-2 border'>Comment</th>
                  <th className='px-4 py-2 border'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-2 border'>{r.product_id}</td>
                    <td className='px-4 py-2 border'>{r.rating}</td>
                    <td className='px-4 py-2 border'>{r.comment}</td>
                    <td className='px-4 py-2 border'>
                      <button
                        onClick={() => handleDelete('vendor_reviews', r.id)}
                        className='bg-red-500 text-white px-2 py-1 rounded hover:opacity-90'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  )
}
