// types/index.ts

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
  latitude: number // Add latitude and longitude properties
  longitude: number // Add latitude and longitude properties
}
