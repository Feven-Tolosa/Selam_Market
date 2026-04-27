'use client'

import { useEffect, useState, useRef } from 'react'
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

type VendorMap = Record<string, string>

export default function AdminVendorChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [adminId, setAdminId] = useState<string>('')
  const [vendorEmails, setVendorEmails] = useState<VendorMap>({})

  const bottomRef = useRef<HTMLDivElement>(null)

  // ADMIN + CONVERSATIONS + VENDOR EMAILS
  useEffect(() => {
    const init = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      setAdminId(user.user.id)

      const { data: convs } = await supabase
        .from('vendor_admin_conversations')
        .select('*')
        .order('created_at', { ascending: false })

      const conversationsData = convs ?? []
      setConversations(conversationsData)

      // 🔥 Get vendor emails (replace vendor_id display)
      const vendorIds = [...new Set(conversationsData.map((c) => c.vendor_id))]

      if (vendorIds.length > 0) {
        const { data: vendors } = await supabase
          .from('users')
          .select('id, email')
          .in('id', vendorIds)

        const map: VendorMap = {}
        vendors?.forEach((v) => {
          map[v.id] = v.email
        })

        setVendorEmails(map)
      }
    }

    init()
  }, [])

  // LOAD MESSAGES
  useEffect(() => {
    if (!activeConv) return

    const load = async () => {
      const { data } = await supabase
        .from('vendor_admin_messages')
        .select('*')
        .eq('conversation_id', activeConv)
        .order('created_at', { ascending: true })

      setMessages(data ?? [])
    }

    load()
  }, [activeConv])

  // REALTIME (NO DUPLICATES)
  useEffect(() => {
    if (!activeConv) return

    const channel = supabase
      .channel(`admin-chat-${activeConv}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_admin_messages',
          filter: `conversation_id=eq.${activeConv}`,
        },
        (payload) => {
          const msg = payload.new as Message

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msg.id)
            if (exists) return prev
            return [...prev, msg]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeConv])

  // SEND MESSAGE (NO DUPLICATION)
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv || !adminId) return

    const text = newMessage
    setNewMessage('')

    const { data, error } = await supabase
      .from('vendor_admin_messages')
      .insert({
        conversation_id: activeConv,
        sender_id: adminId,
        message: text,
      })
      .select()
      .single()

    if (error) return

    setMessages((prev) => {
      const exists = prev.some((m) => m.id === data.id)
      if (exists) return prev
      return [...prev, data]
    })
  }

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='flex h-[80vh] border rounded overflow-hidden'>
      {/* LEFT */}
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
            <p className='text-sm font-medium'>
              Vendor: {vendorEmails[conv.vendor_id] || 'Loading...'}
            </p>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className='flex-1 flex flex-col'>
        {!activeConv ? (
          <div className='flex items-center justify-center h-full text-gray-500'>
            Select a conversation
          </div>
        ) : (
          <>
            {/* MESSAGES */}
            <div className='flex-1 p-4 overflow-y-auto'>
              {messages.map((msg) => {
                const isMe = msg.sender_id === adminId

                return (
                  <div
                    key={msg.id}
                    className={`mb-2 ${isMe ? 'text-right' : 'text-left'}`}
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded ${
                        isMe ? 'bg-black text-white' : 'bg-gray-200'
                      }`}
                    >
                      {msg.message}
                    </span>
                  </div>
                )
              })}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
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
