'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export const useUserRealtimeGuard = (userId?: string) => {
  const router = useRouter()

  useEffect(() => {
    if (!userId) return

    // 1. Subscribe to changes on THIS user
    const channel = supabase
      .channel(`user-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const updatedUser = payload.new as { is_active: boolean }

          // 🚨 If blocked → logout instantly
          if (!updatedUser.is_active) {
            toast.error('Your account has been blocked')

            supabase.auth.signOut()

            router.push('/login')
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router])
}
