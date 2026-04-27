'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
  email: string
}

export default function VendorChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, string>>({})
  const [newMessage, setNewMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // USER
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }
    load()
  }, [])

  // LOAD CONVERSATIONS + USERS
  useEffect(() => {
    if (!userId) return

    const load = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('vendor_id', userId)

      const convs = data ?? []
      setConversations(convs)

      // preload customer emails
      const ids = [...new Set(convs.map((c) => c.customer_id))]

      if (ids.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, email')
          .in('id', ids)

        const map: Record<string, string> = {}
        users?.forEach((u: User) => {
          map[u.id] = u.email
        })

        setUsersMap(map)
      }
    }

    load()
  }, [userId])

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
          .select('id, email')
          .in('id', ids)

        setUsersMap((prev) => {
          const updated = { ...prev }
          users?.forEach((u: User) => {
            updated[u.id] = u.email
          })
          return updated
        })
      }
    }

    load()

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
          const msg = payload.new as Message

          setMessages((prev) => {
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

  // SEND MESSAGE (OPTIMISTIC)
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeConversation) return

    const tempId = `temp-${Date.now()}`

    const optimistic: Message = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: newMessage,
      file_url: null,
      file_type: null,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimistic])
    setNewMessage('')

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: userId,
        message: optimistic.message,
      })
      .select()
      .single()

    if (error) return

    setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
  }

  // FILE UPLOAD (OPTIMISTIC)
  const uploadFile = async (file: File) => {
    if (!activeConversation || !userId) return

    const tempId = `temp-${Date.now()}`
    const localUrl = URL.createObjectURL(file)

    const optimistic: Message = {
      id: tempId,
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: null,
      file_url: localUrl,
      file_type: file.type,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimistic])

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

  return (
    <div className='flex h-[85vh] bg-white rounded-xl overflow-hidden shadow'>
      {/* LEFT PANEL */}
      <div className='w-1/3 border-r bg-gray-50'>
        <div className='p-4 font-semibold border-b'>Conversations</div>

        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveConversation(c)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
              activeConversation?.id === c.id ? 'bg-gray-200' : ''
            }`}
          >
            📧 {usersMap[c.customer_id] || 'Loading...'}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className='flex-1 flex flex-col'>
        {activeConversation ? (
          <>
            <div className='p-4 border-b font-semibold bg-gray-50'>
              Chat with: {usersMap[activeConversation.customer_id] || '...'}
            </div>

            <div className='flex-1 p-4 space-y-3 overflow-y-auto bg-gray-100'>
              {messages.map((msg) => {
                const isMe = msg.sender_id === userId

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-xl text-sm shadow ${
                        isMe ? 'bg-[#10b5cb] text-white' : 'bg-white border'
                      }`}
                    >
                      <div className='text-xs opacity-70 mb-1'>
                        {usersMap[msg.sender_id] || '...'}
                      </div>

                      {msg.message}

                      {msg.file_url && (
                        <img
                          src={msg.file_url}
                          className='mt-2 rounded-lg max-h-48'
                        />
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div className='p-3 border-t flex gap-2 bg-white'>
              <button
                onClick={() => fileInputRef.current?.click()}
                className='px-2'
              >
                📎
              </button>

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
                placeholder='Type a message...'
                className='flex-1 border rounded-full px-4 py-2 focus:outline-none'
              />

              <button
                onClick={sendMessage}
                className='bg-[#10b5cb] text-white px-4 rounded-full'
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className='flex items-center justify-center h-full text-gray-400'>
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}
