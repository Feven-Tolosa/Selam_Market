'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface Vendor {
  id: string
  name: string
}

interface Props {
  currentUserId: string
}

export default function NewChat({ currentUserId }: Props) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState('')

  useEffect(() => {
    async function fetchVendors() {
      const { data } = await supabase.from('vendors').select('*')
      if (data) setVendors(data)
    }
    fetchVendors()
  }, [])

  const handleCreateChat = async () => {
    if (!selectedVendor) return

    // Check if chat already exists
    const { data: existing } = await supabase
      .from('chats')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('vendor_id', selectedVendor)
      .single()

    let chatId = existing?.id

    // If no chat exists, create one
    if (!chatId) {
      const { data: newChat } = await supabase
        .from('chats')
        .insert({
          user_id: currentUserId,
          vendor_id: selectedVendor,
        })
        .select('id')
        .single()
      chatId = newChat?.id
    }

    // Redirect to chat page
    if (chatId) {
      window.location.href = `/chat/${chatId}`
    }
  }

  return (
    <div className='p-4 max-w-md mx-auto'>
      <h2 className='text-xl font-bold mb-4'>Start a Chat with a Vendor</h2>
      <select
        className='border p-2 rounded w-full mb-4'
        value={selectedVendor}
        onChange={(e) => setSelectedVendor(e.target.value)}
      >
        <option value=''>Select a Vendor</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
      <button
        className='bg-blue-500 text-white px-4 py-2 rounded w-full'
        onClick={handleCreateChat}
      >
        Start Chat
      </button>
    </div>
  )
}
