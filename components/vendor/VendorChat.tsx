'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Customer = {
  id: string
  fullname: string
  email: string
}

type Conversation = {
  id: string
  customer_id: string
  created_at: string
  customer: Customer
}

/**
 * 🔥 Raw Supabase response
 */
type RawConversation = {
  id: string
  customer_id: string
  created_at: string
  customer: Customer[] | null
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  created_at: string
}

export default function VendorChat() {
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  /* ========= GET USER ========= */
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) return console.error('User fetch error:', error)
      setUserId(data.user?.id ?? null)
    }
    loadUser()
  }, [])

  /* ========= FETCH CONVERSATIONS ========= */
  useEffect(() => {
    if (!userId) return

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          id,
          customer_id,
          created_at,
          customer:user_id (
            id,
            fullname,
            email
          )
        `,
        )
        .eq('vendor_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Conversations fetch error:', error)
        return
      }

      // 🔥 FIX: normalize
      const formatted: Conversation[] = ((data as RawConversation[]) ?? [])
        .map((item) => {
          const customer = Array.isArray(item.customer)
            ? (item.customer[0] ?? null)
            : item.customer

          if (!customer) return null

          return {
            id: item.id,
            customer_id: item.customer_id,
            created_at: item.created_at,
            customer,
          }
        })
        .filter((c): c is Conversation => c !== null)

      setConversations(formatted)
    }

    fetchConversations()
  }, [userId])

  /* ========= MESSAGES ========= */
  useEffect(() => {
    if (!activeConversation) return
    let isMounted = true

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true })

      if (error) return console.error('Messages load error:', error)
      if (isMounted) setMessages(data || [])
    }

    loadMessages()

    const channel = supabase
      .channel(`vendor-chat-${activeConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [activeConversation])

  /* ========= SEND ========= */
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !userId) return

    const text = newMessage.trim()

    const tempMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: text,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])
    setNewMessage('')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: userId,
        message: text,
      })
      .select()
      .single()

    if (error) {
      console.error('Send error:', error)
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
      setNewMessage(text)
      return
    }

    setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? data : m)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ========= UI ========= */

  return (
    <div className='flex gap-4'>
      {/* SIDEBAR */}
      <div className='w-60 border-r overflow-y-auto'>
        <h2 className='p-3 font-semibold'>Customers</h2>

        {conversations.map((conv) => (
          <button
            key={conv.id}
            className={`block w-full text-left p-3 hover:bg-gray-100 ${
              activeConversation?.id === conv.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => setActiveConversation(conv)}
          >
            {conv.customer.fullname}
          </button>
        ))}
      </div>

      {/* CHAT */}
      <div className='flex-1 flex flex-col h-[500px] border rounded'>
        <div className='p-3 border-b font-semibold'>
          {activeConversation
            ? activeConversation.customer.fullname
            : 'Select a conversation'}
        </div>

        <div className='flex-1 overflow-y-auto p-3 space-y-2'>
          {activeConversation &&
            messages.map((msg) => {
              const isMine = msg.sender_id === userId
              return (
                <div
                  key={msg.id}
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    isMine ? 'bg-[#10b5cb] text-white ml-auto' : 'bg-gray-200'
                  }`}
                >
                  {msg.message}
                </div>
              )
            })}
          <div ref={bottomRef} />
        </div>

        {activeConversation && (
          <div className='p-3 border-t flex gap-2'>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className='flex-1 border rounded px-3 py-2 text-sm'
              placeholder='Type a message...'
            />
            <button
              onClick={sendMessage}
              className='bg-[#10b5cb] text-white px-4 rounded'
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
