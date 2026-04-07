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
  name: string
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

  // CONVERSATIONS
  useEffect(() => {
    if (!userId) return

    const load = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('vendor_id', userId)

      setConversations(data ?? [])
    }

    load()
  }, [userId])

  // LOAD MESSAGES + USERS
  useEffect(() => {
    if (!activeConversation) return

    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true })

      setMessages(data ?? [])

      const ids = [...new Set(data?.map((m) => m.sender_id))]
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

    load()
  }, [activeConversation])

  // SEND
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeConversation) return

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: newMessage,
    })

    setNewMessage('')
  }

  // FILE
  const uploadFile = async (file: File) => {
    if (!activeConversation || !userId) return

    const path = `chat/${Date.now()}-${file.name}`

    await supabase.storage.from('chat-files').upload(path, file)

    const { data } = supabase.storage.from('chat-files').getPublicUrl(path)

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      file_url: data.publicUrl,
      file_type: file.type,
    })
  }

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='flex h-[80vh] bg-white rounded-xl overflow-hidden'>
      {/* LEFT */}
      <div className='w-1/3 border-r'>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveConversation(c)}
            className='p-4 border-b cursor-pointer hover:bg-gray-100'
          >
            {usersMap[c.customer_id] || c.customer_id}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className='flex-1 flex flex-col'>
        {activeConversation && (
          <>
            <div className='flex-1 p-4 space-y-2 overflow-y-auto bg-gray-50'>
              {messages.map((msg) => {
                const isVendor = msg.sender_id === userId

                return (
                  <div key={msg.id}>
                    <div
                      className={`max-w-[65%] px-3 py-2 rounded-lg ${
                        isVendor
                          ? 'ml-auto bg-[#10b5cb] text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {msg.message}

                      {msg.file_url && (
                        <img
                          src={msg.file_url}
                          className='mt-2 rounded max-h-40'
                        />
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
                className='flex-1 border rounded px-3 py-2'
              />

              <button
                onClick={sendMessage}
                className='bg-[#10b5cb] text-white px-4 rounded'
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
