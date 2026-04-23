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

  // ✅ LOAD USER
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }
    load()
  }, [])

  // ✅ LOAD CONVERSATIONS
  useEffect(() => {
    if (!userId) return

    const load = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('vendor_id', userId)

      if (error) console.error(error)

      setConversations(data ?? [])
    }

    load()
  }, [userId])

  // ✅ LOAD MESSAGES + USER EMAILS
  useEffect(() => {
    if (!activeConversation) return

    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error(error)
        return
      }

      setMessages(data ?? [])

      // 🔥 Get unique sender IDs
      const ids = [...new Set(data?.map((m) => m.sender_id))]

      // ✅ Fetch emails from users table
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

    load()
  }, [activeConversation])

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeConversation) return

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: newMessage,
    })

    setNewMessage('')
  }

  // ✅ FILE UPLOAD
  const uploadFile = async (file: File) => {
    if (!activeConversation || !userId) return

    const path = `chat/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('chat-files')
      .upload(path, file)

    if (error) {
      console.error(error)
      return
    }

    const { data } = supabase.storage.from('chat-files').getPublicUrl(path)

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      file_url: data.publicUrl,
      file_type: file.type,
    })
  }

  // ✅ AUTO SCROLL
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
            {/* HEADER */}
            <div className='p-4 border-b font-semibold bg-gray-50'>
              Chat with: {usersMap[activeConversation.customer_id] || '...'}
            </div>

            {/* MESSAGES */}
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
                      {/* Sender email */}
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

            {/* INPUT */}
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
