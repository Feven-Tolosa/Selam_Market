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

    setUsers(usersData || [])
    setVendors(vendorData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getVendorStatus = (userId: string) => {
    return (
      vendors.find((v) => v.user_id === userId)?.subscription_status || 'none'
    )
  }

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-[#10b5cb] mb-6'>
        Users Management
      </h1>

      {/* 🔍 Search bar */}
      <input
        type='text'
        placeholder='Search by email...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='w-full p-3 mb-4 border rounded'
      />

      <div className='overflow-x-auto bg-white rounded shadow'>
        <table className='w-full text-left'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-3'>Email</th>
              <th className='p-3'>Role</th>
              <th className='p-3'>Vendor Status</th>
              <th className='p-3'>Created</th>
              <th className='p-3'>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className='border-t hover:bg-gray-50'>
                <td className='p-3'>{user.email}</td>

                <td className='p-3'>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* 🧠 Vendor status */}
                <td className='p-3'>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      getVendorStatus(user.id) === 'active'
                        ? 'bg-green-200 text-green-800'
                        : getVendorStatus(user.id) === 'trial'
                          ? 'bg-yellow-200 text-yellow-800'
                          : getVendorStatus(user.id) === 'expired'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {getVendorStatus(user.id)}
                  </span>
                </td>

                <td className='p-3 text-sm text-gray-500'>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                {/* 👆 click for full details */}
                <td className='p-3'>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className='bg-[#10b5cb] text-white px-3 py-1 rounded'
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
