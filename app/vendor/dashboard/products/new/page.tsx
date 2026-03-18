'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AddProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  //  HANDLE IMAGE + PREVIEW
  const handleImageChange = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  //  UPLOAD IMAGE TO SUPABASE
  const uploadImage = async () => {
    if (!image) return null

    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, image, {
        cacheControl: '3600',
        upsert: false,
      })

    console.log('UPLOAD:', data, error)

    if (error) {
      alert('Image upload failed: ' + error.message)
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  }

  //  CREATE PRODUCT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const imageUrl = await uploadImage()

    const { data, error } = await supabase.from('products').insert([
      {
        name,
        price: Number(price),
        description,
        category,
        image_url: imageUrl || '',
      },
    ])

    console.log('INSERT:', data, error)

    setLoading(false)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    router.push('/vendor/dashboard/products')
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Add Product</h1>

      <form
        onSubmit={handleSubmit}
        className='space-y-5 bg-white p-6 rounded-xl shadow'
      >
        {/* NAME */}
        <input
          type='text'
          placeholder='Product name'
          className='w-full border p-3 rounded-lg'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* PRICE */}
        <input
          type='number'
          placeholder='Price'
          className='w-full border p-3 rounded-lg'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        {/* CATEGORY */}
        <input
          type='text'
          placeholder='Category (e.g. Shoes, Electronics)'
          className='w-full border p-3 rounded-lg'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder='Product description...'
          className='w-full border p-3 rounded-lg'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        {/* IMAGE INPUT */}
        <div>
          <label className='block mb-2 text-sm font-medium'>
            Product Image
          </label>

          <input
            type='file'
            accept='image/png, image/jpeg, image/webp'
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImageChange(e.target.files[0])
              }
            }}
          />

          {/* PREVIEW */}
          {preview && (
            <div className='mt-4'>
              <img
                src={preview}
                alt='Preview'
                className='w-40 h-40 object-cover rounded-lg border'
              />
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-[#10b5cb] hover:bg-[#0ea5b7] text-white py-3 rounded-lg'
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}
