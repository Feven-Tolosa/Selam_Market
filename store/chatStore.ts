import { create } from 'zustand'

type ChatState = {
  isOpen: boolean
  vendorId: string | null
  openChat: (vendorId: string) => void
  closeChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  vendorId: null,

  openChat: (vendorId) => set({ isOpen: true, vendorId }),

  closeChat: () => set({ isOpen: false, vendorId: null }),
}))
