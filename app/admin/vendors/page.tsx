'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type Vendor = {
  id: string
  store_name: string
  user_id: string
  trial_start: string | null
  trial_end: string | null
  subscription_status: string
  message: string | null
}

type User = {
  id: string
  email: string
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Fetch vendors + users
  const fetchData = async () => {
    const { data: vendorsData } = await supabase.from('vendors').select('*')
    const { data: usersData } = await supabase.from('users').select('id,email')

    setVendors(vendorsData || [])
    setUsers(usersData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getEmail = (user_id: string) => {
    return users.find((u) => u.id === user_id)?.email || ''
  }

  // Start trial
  const startTrial = async (vendorId: string) => {
    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + 7)

    const { error } = await supabase
      .from('vendors')
      .update({
        trial_start: start.toISOString(),
        trial_end: end.toISOString(),
        subscription_status: 'trial',
        message: 'Your free trial has started 🎉',
      })
      .eq('id', vendorId)

    if (error) return toast.error(error.message)

    toast.success('Trial started')
    fetchData()
  }

  // // Generate payment link
  // const generateChapaLink = (email: string) => {
  //   const tx_ref = `tx-${Date.now()}`
  //   return `https://api.chapa.co/v1/hosted/pay?public_key=YOUR_PUBLIC_KEY&tx_ref=${tx_ref}&amount=500&currency=ETB&email=${email}`
  // }

  // Send email
  const sendEmail = async (email: string, message: string) => {
    await fetch('/api/send-email', {
      method: 'POST',
      body: JSON.stringify({ email, message }),
    })
  }

  //  End trial
  const endTrial = async (vendor: Vendor) => {
    const email = getEmail(vendor.user_id)
    // const paymentLink = generateChapaLink(email)

    const message = `Your trial has ended. Please proceed to payment to continue using our services. ${/*Payment Link: ${paymentLink}*/ ''}`

    // Update DB
    const { error } = await supabase
      .from('vendors')
      .update({
        subscription_status: 'expired',
        message,
      })
      .eq('id', vendor.id)

    if (error) return toast.error(error.message)

    // Send email
    await sendEmail(email, message)

    toast.success('Payment request sent 💳')
    fetchData()
  }

  // Auto expire check
  const checkExpired = async () => {
    const now = new Date()

    vendors.forEach(async (vendor) => {
      if (
        vendor.trial_end &&
        new Date(vendor.trial_end) < now &&
        vendor.subscription_status === 'trial'
      ) {
        await endTrial(vendor)
      }
    })
  }

  useEffect(() => {
    if (vendors.length) checkExpired()
  }, [vendors])

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-3xl font-bold mb-6 text-[#10b5cb]'>
        Vendors Management
      </h1>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className='bg-white p-4 rounded shadow hover:shadow-lg'
          >
            <h3 className='font-bold'>{vendor.store_name}</h3>

            <p className='text-sm'>
              Status: <strong>{vendor.subscription_status}</strong>
            </p>

            <p className='text-xs text-gray-500'>
              Trial Ends: {vendor.trial_end || 'Not set'}
            </p>

            {vendor.message && (
              <p className='text-xs mt-2 text-yellow-700'>{vendor.message}</p>
            )}

            <div className='flex gap-2 mt-3'>
              <button
                onClick={() => startTrial(vendor.id)}
                className='bg-blue-500 text-white px-3 py-1 rounded'
              >
                Start Trial
              </button>

              <button
                onClick={() => endTrial(vendor)}
                className='bg-red-500 text-white px-3 py-1 rounded'
              >
                End Trial
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
