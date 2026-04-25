'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

type User = {
  id: string
  email: string
  role: string
  created_at: string
  is_active: boolean
}

type Vendor = {
  user_id: string
  subscription_status: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    const [{ data: usersData }, { data: vendorData }] = await Promise.all([
      supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase.from('vendors').select('user_id, subscription_status'),
    ])

    setUsers(usersData ?? [])
    setVendors(vendorData ?? [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleUser = async (user: User) => {
    const newStatus = !user.is_active

    const { error } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(newStatus ? 'User reactivated' : 'User blocked')
    fetchData()
  }

  const getVendorStatus = (id: string) =>
    vendors.find((v) => v.user_id === id)?.subscription_status || 'none'

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-[#10b5cb] mb-6'>
        Users Management
      </h1>

      <input
        className='w-full p-3 mb-4 border rounded'
        placeholder='Search user...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className='bg-white rounded shadow overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-3'>Email</th>
              <th className='p-3'>Role</th>
              <th className='p-3'>Status</th>
              <th className='p-3'>Vendor</th>
              <th className='p-3'>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className='border-t'>
                <td className='p-3'>{u.email}</td>
                <td className='p-3'>{u.role}</td>

                <td className='p-3'>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.is_active
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {u.is_active ? 'active' : 'blocked'}
                  </span>
                </td>

                <td className='p-3'>{getVendorStatus(u.id)}</td>

                <td className='p-3 flex gap-2'>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className='px-3 py-1 bg-[#10b5cb] text-white rounded'
                  >
                    View
                  </Link>

                  <button
                    onClick={() => toggleUser(u)}
                    className={`px-3 py-1 rounded text-white ${
                      u.is_active ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  >
                    {u.is_active ? 'Block' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
