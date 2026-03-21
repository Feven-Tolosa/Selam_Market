'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type VendorContextType = {
  vendorId: string | null
  loading: boolean
}

const VendorContext = createContext<VendorContextType>({
  vendorId: null,
  loading: true,
})

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVendor() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      setVendorId(data?.id || null)
      setLoading(false)
    }

    loadVendor()
  }, [])

  return (
    <VendorContext.Provider value={{ vendorId, loading }}>
      {children}
    </VendorContext.Provider>
  )
}

export const useVendor = () => useContext(VendorContext)
