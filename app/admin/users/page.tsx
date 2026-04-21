'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type User = {
  id: string
  email: string
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 👑 Promote to admin
  const makeAdmin = async (id: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', id)

    if (error) return toast.error(error.message)

    toast.success('User promoted to admin 👑')
    fetchUsers()
  }

  // 👤 Demote to user
  const removeAdmin = async (id: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('id', id)

    if (error) return toast.error(error.message)

    toast.success('Admin removed')
    fetchUsers()
  }

  if (loading) return <p className='p-10'>Loading users...</p>

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold text-[#10b5cb] mb-6'>
        User Management
      </h1>

      <div className='overflow-x-auto bg-white rounded shadow'>
        <table className='w-full text-left'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='p-3'>Email</th>
              <th className='p-3'>Role</th>
              <th className='p-3'>Created</th>
              <th className='p-3'>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className='border-t'>
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

                <td className='p-3 text-sm text-gray-500'>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>

                <td className='p-3 flex gap-2'>
                  {user.role !== 'admin' ? (
                    <button
                      onClick={() => makeAdmin(user.id)}
                      className='bg-green-500 text-white px-3 py-1 rounded'
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => removeAdmin(user.id)}
                      className='bg-red-500 text-white px-3 py-1 rounded'
                    >
                      Remove Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
