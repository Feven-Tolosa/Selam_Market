'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AddProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()

    const user = userData.user

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    let image_url = ''

    if (image) {
      const fileName = `${Date.now()}-${image.name}`

      const { data } = await supabase.storage
        .from('products')
        .upload(fileName, image)

      image_url = data?.path || ''
    }

    await supabase.from('products').insert([
      {
        name,
        description,
        price,
        image_url,
        // vendor_id: vendor.id,
      },
    ])

    router.push('/vendor/dashboard')
  }

  return (
    <div className='max-w-xl mx-auto py-16'>
      <h1 className='text-2xl font-semibold mb-6'>Add Product</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          placeholder='Product name'
          className='w-full border p-3 rounded'
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder='Description'
          className='w-full border p-3 rounded'
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type='number'
          placeholder='Price'
          className='w-full border p-3 rounded'
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type='file'
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />

        <button className='bg-[#10b5cb] text-white px-6 py-3 rounded w-full'>
          Add Product
        </button>
      </form>
    </div>
  )
}
