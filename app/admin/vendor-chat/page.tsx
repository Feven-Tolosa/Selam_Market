'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Conversation = {
  id: string
  vendor_id: string
  created_at: string
}

type Message = {
  id: string
  message: string
  sender_id: string
  created_at: string
  conversation_id: string
}

export default function AdminVendorChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [adminId, setAdminId] = useState<string>('')

  // 🔹 Get admin + conversations
  useEffect(() => {
    const init = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      setAdminId(user.user.id)

      const { data } = await supabase
        .from('vendor_admin_conversations')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setConversations(data)
    }

    init()
  }, [])

  // 🔹 Load messages when selecting conversation
  useEffect(() => {
    if (!activeConv) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('vendor_admin_messages')
        .select('*')
        .eq('conversation_id', activeConv)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    }

    fetchMessages()
  }, [activeConv])

  // 🔹 Realtime (messages)
  useEffect(() => {
    if (!activeConv) return

    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_admin_messages',
          filter: `conversation_id=eq.${activeConv}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeConv])

  // 🔹 Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return

    await supabase.from('vendor_admin_messages').insert({
      conversation_id: activeConv,
      sender_id: adminId,
      message: newMessage,
    })

    setNewMessage('')
  }

  return (
    <div className='flex h-[80vh] border rounded overflow-hidden'>
      {/* LEFT: Conversations */}
      <div className='w-1/3 border-r overflow-y-auto'>
        <h2 className='p-3 font-bold border-b'>Vendor Chats</h2>

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setActiveConv(conv.id)}
            className={`p-3 cursor-pointer border-b hover:bg-gray-100 ${
              activeConv === conv.id ? 'bg-gray-200' : ''
            }`}
          >
            <p className='text-sm font-medium'>Vendor: {conv.vendor_id}</p>
          </div>
        ))}
      </div>

      {/* RIGHT: Chat */}
      <div className='flex-1 flex flex-col'>
        {!activeConv ? (
          <div className='flex items-center justify-center h-full text-gray-500'>
            Select a conversation
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className='flex-1 p-4 overflow-y-auto'>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 ${
                    msg.sender_id === adminId ? 'text-right' : 'text-left'
                  }`}
                >
                  <span className='inline-block bg-gray-200 px-3 py-1 rounded'>
                    {msg.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className='p-3 border-t flex gap-2'>
              <input
                className='flex-1 border px-3 py-2 rounded'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder='Reply to vendor...'
              />
              <button
                onClick={sendMessage}
                className='bg-black text-white px-4 rounded'
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
