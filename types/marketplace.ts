export type Vendor = {
  id: string
  store_name: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  location: string | null
}

export type Product = {
  id: string
  vendor_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  created_at: string
}
