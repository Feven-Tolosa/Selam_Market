'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    async function loadProduct() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (data) {
        setName(data.name)
        setDescription(data.description)
        setPrice(data.price)
      }
    }

    loadProduct()
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    await supabase
      .from('products')
      .update({
        name,
        description,
        price,
      })
      .eq('id', params.id)

    router.push('/vendor/dashboard/profile')
  }

  return (
    <form onSubmit={handleSave} className='max-w-xl space-y-4'>
      <h1 className='text-xl font-semibold'>Edit Product</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='w-full border p-3 rounded'
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className='w-full border p-3 rounded'
      />

      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className='w-full border p-3 rounded'
      />

      <button className='bg-[#10b5cb] text-white px-6 py-3 rounded'>
        Save Changes
      </button>
    </form>
  )
}
