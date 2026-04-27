'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useChatStore } from '@/store/chatStore'

type Conversation = {
  id: string
  customer_id: string
  vendor_id: string
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  message: string | null
  file_url: string | null
  file_type: string | null
  created_at: string
}

type User = {
  id: string
  name: string
}

export default function ChatOverlay() {
  const { isOpen, vendorId, closeChat } = useChatStore()

  const [userId, setUserId] = useState<string | null>(null)
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, string>>({})
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // USER
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }
    load()
  }, [])

  // INIT CONVERSATION
  useEffect(() => {
    if (!vendorId || !userId) return

    const init = async () => {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('user_id')
        .eq('id', vendorId)
        .single()

      const vendorUserId = vendor?.user_id
      if (!vendorUserId) return

      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', userId)
        .eq('vendor_id', vendorUserId)
        .maybeSingle()

      if (existing) {
        setActiveConversation(existing)
        return
      }

      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          customer_id: userId,
          vendor_id: vendorUserId,
        })
        .select()
        .single()

      setActiveConversation(newConv)
    }

    init()
  }, [vendorId, userId])

  // LOAD MESSAGES + REALTIME
  useEffect(() => {
    if (!activeConversation) return

    let isMounted = true

    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true })

      if (!isMounted) return

      const msgs = data ?? []
      setMessages(msgs)

      const ids = [...new Set(msgs.map((m) => m.sender_id))]

      if (ids.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, name')
          .in('id', ids)

        const map: Record<string, string> = {}
        users?.forEach((u: User) => {
          map[u.id] = u.name
        })

        setUsersMap(map)
      }
    }

    load()

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
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [activeConversation])

  // SEND TEXT (OPTIMISTIC)
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeConversation) return

    const tempId = `temp-${Date.now()}`

    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: newMessage,
      file_url: null,
      file_type: null,
      created_at: new Date().toISOString(),
    }

    // instantly show message
    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage('')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: userId,
        message: optimisticMessage.message,
      })
      .select()
      .single()

    if (error) return

    // replace temp message with real one
    setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
  }

  // FILE UPLOAD (OPTIMISTIC)
  const uploadFile = async (file: File) => {
    if (!activeConversation || !userId) return

    const tempId = `temp-${Date.now()}`
    const localUrl = URL.createObjectURL(file)

    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: null,
      file_url: localUrl,
      file_type: file.type,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMessage])

    const path = `chat/${Date.now()}-${file.name}`

    await supabase.storage.from('chat-files').upload(path, file)

    const { data } = supabase.storage.from('chat-files').getPublicUrl(path)

    const { data: inserted } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: userId,
        file_url: data.publicUrl,
        file_type: file.type,
      })
      .select()
      .single()

    setMessages((prev) => prev.map((m) => (m.id === tempId ? inserted : m)))
  }

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) return null

  return (
    <div className='fixed bottom-5 right-5 w-[380px] h-[500px] bg-white rounded-xl shadow flex flex-col'>
      <div className='p-3 border-b flex justify-between'>
        <span>Chat</span>
        <button onClick={closeChat}>✕</button>
      </div>

      <div className='flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50'>
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId

          return (
            <div key={msg.id} className='flex flex-col'>
              <span className='text-xs text-gray-400'>
                {usersMap[msg.sender_id] || 'User'}
              </span>

              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg ${
                  isMine ? 'ml-auto bg-gray-200' : 'bg-[#10b5cb] text-white'
                }`}
              >
                {msg.message}

                {msg.file_url && (
                  <img src={msg.file_url} className='mt-2 rounded' />
                )}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <div className='p-3 border-t flex gap-2'>
        <button onClick={() => fileInputRef.current?.click()}>📎</button>

        <input
          type='file'
          ref={fileInputRef}
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
          }}
        />

        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className='flex-1 border rounded px-3 py-2 text-sm'
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
