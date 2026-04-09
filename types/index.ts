export type Category = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
  category_id: string
  category_name?: string
}

export type Vendor = {
  id: string
  store_name: string
  description: string
  banner_url: string | null
  location: string
  latitude: number //  latitude and longitude properties
  longitude: number // latitude and longitude properties
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  customer_id: string
  vendor_id: string
  created_at: string
}
