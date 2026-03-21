'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useVendor } from '@/lib/VendorContext'

export default function AddProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { vendorId, loading: vendorLoading } = useVendor()

  // IMAGE PREVIEW
  const handleImageChange = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  // UPLOAD IMAGE
  const uploadImage = async () => {
    if (!image) return null

    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, image)

    if (error) {
      alert('Image upload failed: ' + error.message)
      return null
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  // CREATE PRODUCT (FIXED)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // ✅ 1. Get user
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      alert('User not found')
      setLoading(false)
      return
    }

    // ✅ 2. Get vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (vendorError) {
      console.error(vendorError)
      alert('Error fetching vendor')
      setLoading(false)
      return
    }

    if (!vendor) {
      alert('Vendor not found (RLS issue likely)')
      setLoading(false)
      return
    }

    // ✅ 3. Upload image
    const imageUrl = await uploadImage()

    if (!vendorId) {
      alert('You are not a vendor or not approved yet')
      return
    }

    await supabase.from('products').insert({
      name,
      price: Number(price),
      description,
      category,
      image_url: imageUrl || '',
      vendor_id: vendorId,
    })
    console.log('USER:', user)
    console.log('VENDOR RESULT:', vendor)
    console.log('VENDOR ID:', vendor?.id)

    // ✅ 4. Insert product WITH vendor_id
    const { error } = await supabase.from('products').insert([
      {
        name,
        price: Number(price),
        description,
        category,
        image_url: imageUrl,
        vendor_id: vendor.id, // 🔥 THIS IS THE KEY FIX
      },
    ])

    setLoading(false)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    alert('Product created successfully!')

    router.push('/vendor/profile') // or your products page
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
          placeholder='Category'
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

        {/* IMAGE */}
        <div>
          <label className='block mb-2 text-sm font-medium'>
            Product Image
          </label>

          <input
            type='file'
            accept='image/*'
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImageChange(e.target.files[0])
              }
            }}
          />

          {preview && (
            <img
              src={preview}
              className='w-40 h-40 mt-4 object-cover rounded-lg border'
            />
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
