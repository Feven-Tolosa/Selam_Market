// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams } from 'next/navigation'
// import { supabase } from '@/lib/supabaseClient'

// interface Message {
//   id: string
//   chat_id: string
//   sender_id: string
//   text: string
//   created_at: string
// }

// interface ChatProps {
//   currentUserId: string
// }

// export default function ChatWindow({ currentUserId }: ChatProps) {
//   const { chatId } = useParams()
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState('')

//   // Fetch messages
//   useEffect(() => {
//     async function fetchMessages() {
//       const { data } = await supabase
//         .from('messages')
//         .select('*')
//         .eq('chat_id', chatId)
//         .order('created_at', { ascending: true })
//       if (data) setMessages(data)
//     }
//     fetchMessages()
//   }, [chatId])

//   // Realtime subscription
//   useEffect(() => {
//     const channel = supabase
//       .channel(`chat-${chatId}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'messages',
//           filter: `chat_id=eq.${chatId}`,
//         },
//         (payload) => {
//           setMessages((prev) => [...prev, payload.new as Message])
//         },
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [chatId])

//   // Send message
//   const handleSend = async () => {
//     if (!newMessage.trim()) return

//     await supabase.from('messages').insert({
//       chat_id: chatId,
//       sender_id: currentUserId,
//       text: newMessage,
//     })

//     setNewMessage('')

//     // Update chat's updated_at
//     await supabase
//       .from('chats')
//       .update({ updated_at: new Date() })
//       .eq('id', chatId)
//   }

//   return (
//     <div className='flex flex-col h-screen p-4 border rounded'>
//       <div className='flex-1 overflow-y-auto mb-2 space-y-2'>
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`p-2 rounded ${msg.sender_id === currentUserId ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}
//           >
//             {msg.text}
//             <div className='text-xs text-gray-500'>
//               {new Date(msg.created_at).toLocaleTimeString()}
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className='flex gap-2'>
//         <input
//           type='text'
//           className='flex-1 border rounded p-2'
//           placeholder='Type your message...'
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//         />
//         <button
//           onClick={handleSend}
//           className='bg-blue-500 text-white px-4 rounded'
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   )
// }
