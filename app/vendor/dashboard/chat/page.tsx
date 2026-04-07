'use client'

import { useEffect, useRef, useState } from 'react'
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

export default function VendorChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [typing, setTyping] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // -------------------------
  // USER
  // -------------------------
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }
    loadUser()
  }, [])

  // -------------------------
  // LOAD CONVERSATIONS
  // -------------------------
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

  // -------------------------
  // LOAD MESSAGES + REALTIME
  // -------------------------
  useEffect(() => {
    if (!activeConversation) return

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true })

      setMessages(data ?? [])
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
          const msg = payload.new as Message
          setMessages((prev) => [...prev, msg])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeConversation])

  // -------------------------
  // SEND TEXT
  // -------------------------
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !userId) return

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      message: newMessage,
    })

    setNewMessage('')
  }

  // -------------------------
  // FILE UPLOAD
  // -------------------------
  const handleFileUpload = async (file: File) => {
    if (!activeConversation || !userId) return

    const filePath = `chat/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file)

    if (uploadError) {
      console.error(uploadError)
      return
    }

    const { data } = supabase.storage.from('chat-files').getPublicUrl(filePath)

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      file_url: data.publicUrl,
      file_type: file.type,
    })
  }

  // -------------------------
  // TYPING INDICATOR
  // -------------------------
  const sendTyping = async () => {
    if (!activeConversation || !userId) return

    setTyping(true)

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: userId,
      is_typing: true,
    })

    setTimeout(() => setTyping(false), 1500)
  }

  // -------------------------
  // AUTO SCROLL
  // -------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className='flex h-[80vh] border rounded-xl overflow-hidden bg-white'>
      {/* LEFT */}
      <div className='w-1/3 border-r overflow-y-auto'>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveConversation(c)}
            className='p-4 cursor-pointer hover:bg-gray-100'
          >
            Customer: {c.customer_id}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className='flex-1 flex flex-col'>
        {!activeConversation && (
          <div className='flex-1 flex items-center justify-center text-gray-400'>
            Select chat
          </div>
        )}

        {activeConversation && (
          <>
            {/* HEADER */}
            <div className='p-3 border-b font-semibold'>Chat</div>

            {/* MESSAGES */}
            <div className='flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50'>
              {messages.map((msg) => {
                const isMine = msg.sender_id === userId

                return (
                  <div
                    key={msg.id}
                    className={`max-w-[65%] px-3 py-2 rounded-lg text-sm ${
                      isMine
                        ? 'bg-[#10b5cb] text-white ml-auto'
                        : 'bg-white border'
                    }`}
                  >
                    {msg.message && <p>{msg.message}</p>}

                    {msg.file_url && (
                      <div>
                        {msg.file_type?.startsWith('image') ? (
                          <img
                            src={msg.file_url}
                            className='rounded mt-2 max-h-40'
                          />
                        ) : (
                          <a
                            href={msg.file_url}
                            target='_blank'
                            className='text-blue-500 underline'
                          >
                            Download file
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className='p-3 border-t flex items-center gap-2'>
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
                  if (file) handleFileUpload(file)
                }}
              />

              <input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  sendTyping()
                }}
                className='flex-1 border rounded px-3 py-2 text-sm'
                placeholder='Type a message...'
              />

              <button
                onClick={sendMessage}
                className='bg-[#10b5cb] text-white px-4 py-2 rounded'
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
