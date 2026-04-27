'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Message = {
  id: string
  message: string
  sender_id: string
  created_at: string
  conversation_id: string
}

export default function ContactAdminPage() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string>('')

  const bottomRef = useRef<HTMLDivElement>(null)

  // INIT
  useEffect(() => {
    const init = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const uid = user.user.id
      setUserId(uid)

      const { data: existing } = await supabase
        .from('vendor_admin_conversations')
        .select('*')
        .eq('vendor_id', uid)
        .maybeSingle()

      let convId: string | null = null

      if (existing) {
        convId = existing.id
      } else {
        const { data: created } = await supabase
          .from('vendor_admin_conversations')
          .insert({ vendor_id: uid })
          .select()
          .single()

        convId = created?.id ?? null
      }

      if (convId) {
        setConversationId(convId)
        loadMessages(convId)
      }
    }

    init()
  }, [])

  // LOAD MESSAGES
  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('vendor_admin_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    setMessages(data ?? [])
  }

  // REALTIME
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`vendor-admin-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_admin_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message

          setMessages((prev) => {
            // prevent duplicates
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // SEND MESSAGE (OPTIMISTIC)
  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !userId) return

    const tempId = `temp-${Date.now()}`

    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: userId,
      message: newMessage,
      created_at: new Date().toISOString(),
    }

    // instant UI
    setMessages((prev) => [...prev, optimistic])
    setNewMessage('')

    const { data, error } = await supabase
      .from('vendor_admin_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        message: optimistic.message,
      })
      .select()
      .single()

    if (error) return

    // replace temp with real
    setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
  }

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='p-2 max-w-xl mx-auto'>
      <h1 className='text-xl text-[#10b5cb] font-bold mb-4'>Contact Admin</h1>

      <div className='border rounded p-3 h-92 overflow-y-auto mb-3'>
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
        <div ref={bottomRef} />
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
          className='bg-[#10b5cb] text-white px-4 rounded'
        >
          Send
        </button>
      </div>
    </div>
  )
}
