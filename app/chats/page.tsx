'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface Chat {
  id: string
  user_id: string
  vendor_id: string
  updated_at: string
}

interface Props {
  currentUserId: string
  isAdmin?: boolean
}

export default function ChatList({ currentUserId, isAdmin }: Props) {
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    async function fetchChats() {
      let query = supabase
        .from<Chat>('chats')
        .select('*')
        .order('updated_at', { ascending: false })
      if (!isAdmin) {
        query = query.or(
          `user_id.eq.${currentUserId},vendor_id.eq.${currentUserId}`,
        )
      }
      const { data } = await query
      if (data) setChats(data)
    }
    fetchChats()
  }, [currentUserId, isAdmin])

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Chats</h2>
      <ul className='space-y-2'>
        {chats.map((chat) => (
          <li key={chat.id} className='border p-2 rounded hover:bg-gray-100'>
            <Link href={`/chat/${chat.id}`}>
              Chat with{' '}
              {isAdmin
                ? `User: ${chat.user_id}, Vendor: ${chat.vendor_id}`
                : 'Click to open'}
            </Link>
            <div className='text-xs text-gray-500'>
              {new Date(chat.updated_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
