'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useChatStore } from '@/store/chatStore'

type Conversation = {
  id: string
  customer_id: string
  vendor_id: string
  created_at: string
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  created_at: string
}

export default function ChatOverlay() {
  const { isOpen, vendorId, closeChat } = useChatStore()

  const [userId, setUserId] = useState<string | null>(null)

  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // -------------------------
  // GET USER
  // -------------------------
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
    }

    loadUser()
  }, [])

  // -------------------------
  // INIT CONVERSATION
  // -------------------------
  useEffect(() => {
    if (!vendorId || !userId) return

    const initConversation = async () => {
      setLoading(true)

      // 🔍 find existing conversation
      const { data: existing, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', userId)
        .eq('vendor_id', vendorId)
        .maybeSingle()

      if (error) {
        console.error('Conversation fetch error:', error)
        setLoading(false)
        return
      }

      if (existing) {
        setActiveConversation(existing)
        setLoading(false)
        return
      }

      // ➕ create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          customer_id: userId,
          vendor_id: vendorId,
        })
        .select()
        .single()

      if (createError) {
        console.error('Conversation create error:', createError)
        setLoading(false)
        return
      }

      setActiveConversation(newConv)
      setLoading(false)
    }

    initConversation()
  }, [vendorId, userId])

  // -------------------------
  // LOAD MESSAGES + REALTIME
  // -------------------------
  useEffect(() => {
    if (!activeConversation) return

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Messages load error:', error)
        return
      }

      setMessages(data || [])
    }

    loadMessages()

    // 🔴 REALTIME SUBSCRIPTION
    const channel = supabase
      .channel(`chat-${activeConversation.id}`)
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
      supabase.removeChannel(channel)
    }
  }, [activeConversation])

  // -------------------------
  // SEND MESSAGE
  // -------------------------
  const sendMessage = async () => {
    if (!newMessage.trim()) return
    if (!activeConversation || !userId) return

    const text = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: text,
    })

    if (error) {
      console.error('Send error:', error)
      setNewMessage(text) // restore message if failed
      return
    }
  }

  // -------------------------
  // ENTER KEY SEND
  // -------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  // -------------------------
  // AUTO SCROLL
  // -------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // -------------------------
  // UI STATES
  // -------------------------
  if (!isOpen) return null

  if (!userId) {
    return (
      <div className='fixed bottom-5 right-5 bg-white p-5 shadow rounded'>
        Please login to chat
      </div>
    )
  }

  return (
    <div className='fixed bottom-5 right-5 w-380px h-125 bg-white shadow-xl rounded-xl flex flex-col z-50'>
      {/* HEADER */}
      <div className='p-3 border-b flex justify-between items-center'>
        <p className='font-semibold'>Chat</p>
        <button onClick={closeChat}>✕</button>
      </div>

      {/* MESSAGES */}
      <div className='flex-1 overflow-y-auto p-3 space-y-2'>
        {loading && <p className='text-sm text-gray-400'>Loading...</p>}

        {!loading && messages.length === 0 && (
          <p className='text-sm text-gray-400'>No messages yet</p>
        )}

        {messages.map((msg) => {
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

      {/* INPUT */}
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
    </div>
  )
}
