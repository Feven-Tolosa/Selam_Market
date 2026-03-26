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
