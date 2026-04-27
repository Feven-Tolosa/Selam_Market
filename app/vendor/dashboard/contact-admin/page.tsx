'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Message = {
  id: string
  message: string
  sender_id: string
  created_at: string
}

export default function ContactAdminPage() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string>('')

  // Get or create conversation
  useEffect(() => {
    const init = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      setUserId(user.user.id)

      // check existing conversation
      const { data: existing } = await supabase
        .from('vendor_admin_conversations')
        .select('*')
        .eq('vendor_id', user.user.id)
        .single()

      if (existing) {
        setConversationId(existing.id)
        fetchMessages(existing.id)
      } else {
        const { data: created } = await supabase
          .from('vendor_admin_conversations')
          .insert({ vendor_id: user.user.id })
          .select()
          .single()

        if (created) {
          setConversationId(created.id)
        }
      }
    }

    init()
  }, [])

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from('vendor_admin_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  // realtime
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel('vendor-admin-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_admin_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return

    await supabase.from('vendor_admin_messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      message: newMessage,
    })

    setNewMessage('')
  }

  return (
    <div className='p-4 max-w-xl mx-auto'>
      <h1 className='text-xl font-bold mb-4'>Contact Admin</h1>

      <div className='border rounded p-3 h-96 overflow-y-auto mb-3'>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${
              msg.sender_id === userId ? 'text-right' : 'text-left'
            }`}
          >
            <span className='inline-block bg-gray-200 px-3 py-1 rounded'>
              {msg.message}
            </span>
          </div>
        ))}
      </div>

      <div className='flex gap-2'>
        <input
          className='flex-1 border rounded px-3 py-2'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='Type message...'
        />
        <button
          onClick={sendMessage}
          className='bg-black text-white px-4 rounded'
        >
          Send
        </button>
      </div>
    </div>
  )
}
