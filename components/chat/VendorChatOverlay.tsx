'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Conversation = {
  id: string
  name?: string
  customer_id: string
  vendor_id: string
  created_at: string
  customer_name: string
}

type Message = {
  id: string
  name?: string
  conversation_id: string
  sender_id: string
  message: string
  created_at: string
}

export default function VendorChatOverlay() {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // -------------------------
  // GET CURRENT VENDOR
  // -------------------------
  useEffect(() => {
    const loadVendor = async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser()
        if (authError) throw authError

        const userId = authData.user?.id
        if (!userId) return

        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', userId)
          .single()
        if (vendorError || !vendorData) throw vendorError

        setVendorId(vendorData.id)
      } catch (error) {
        console.error('Failed to fetch vendor:', error)
      }
    }

    loadVendor()
  }, [])

  // -------------------------
  // LOAD VENDOR CONVERSATIONS
  // -------------------------
  useEffect(() => {
    if (!vendorId) return

    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(
            `
            id,
            customer_id,
            vendor_id,
            created_at,
            customers!inner(name)
          `,
          )
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const mapped: Conversation[] = data.map((conv) => ({
          id: conv.id,
          customer_id: conv.customer_id,
          vendor_id: conv.vendor_id,
          created_at: conv.created_at,
          customer_name: conv.customers?.name || 'Customer',
        }))

        // Only update state after async work completes
        setConversations(mapped)
      } catch (error) {
        console.error('Conversations fetch error:', error)
      }
    }

    fetchConversations()
  }, [vendorId])

  // -------------------------
  // LOAD MESSAGES + REALTIME
  // -------------------------
  useEffect(() => {
    if (!activeConversation) return

    let isMounted = true
    const loadMessages = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from<Message>('messages')
          .select('*')
          .eq('conversation_id', activeConversation.id)
          .order('created_at', { ascending: true })

        if (error) throw error
        if (isMounted) setMessages(data)
      } catch (error) {
        console.error('Messages load error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMessages()

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
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [activeConversation])

  // -------------------------
  // SEND MESSAGE
  // -------------------------
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !vendorId) return

    const text = newMessage.trim()
    const tempMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConversation.id,
      sender_id: vendorId,
      message: text,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])
    setNewMessage('')

    try {
      const { data, error } = await supabase
        .from<Message>('messages')
        .insert({
          conversation_id: activeConversation.id,
          sender_id: vendorId,
          message: text,
        })
        .select()
        .single()

      if (error) throw error
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMessage.id ? data : m)),
      )
    } catch (error) {
      console.error('Send error:', error)
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
      setNewMessage(text)
    }
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

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className='fixed bottom-5 right-5 w-[420px] h-[500px] bg-white shadow-xl rounded-xl flex z-50'>
      {/* CONVERSATION LIST */}
      <div className='w-[150px] border-r overflow-y-auto'>
        {loading && <p className='p-3 text-gray-400 text-sm'>Loading...</p>}

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setActiveConversation(conv)}
            className={`p-3 cursor-pointer border-b hover:bg-gray-100 ${
              activeConversation?.id === conv.id
                ? 'bg-gray-200 font-semibold'
                : ''
            }`}
          >
            {conv.customer_name}
          </div>
        ))}
      </div>

      {/* CHAT PANEL */}
      <div className='flex-1 flex flex-col'>
        <div className='p-3 border-b flex justify-between items-center'>
          <p className='font-semibold'>
            {activeConversation?.customer_name || 'Select a customer'}
          </p>
        </div>

        <div className='flex-1 overflow-y-auto p-3 space-y-2'>
          {loading && <p className='text-sm text-gray-400'>Loading...</p>}

          {!loading && messages.length === 0 && activeConversation && (
            <p className='text-sm text-gray-400'>No messages yet</p>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === vendorId
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
