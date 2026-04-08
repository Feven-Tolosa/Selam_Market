'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import toast from 'react-hot-toast'

type ProductImage = {
  id: string
  image_url: string
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [description, setDescription] = useState('')

  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState('/placeholder.png')

  const [extraImages, setExtraImages] = useState<File[]>([])
  const [extraPreviews, setExtraPreviews] = useState<string[]>([])

  const [existingImages, setExistingImages] = useState<ProductImage[]>([])

  const [loading, setLoading] = useState(false)

  // -------------------------
  // LOAD PRODUCT
  // -------------------------

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        toast.error('Product not found')
        return
      }

      setName(data.name)
      setPrice(data.price)
      setDescription(data.description || '')

      if (data.image_url) {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.image_url)

        setMainPreview(urlData.publicUrl)
      }

      // Load extra images
      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)

      setExistingImages(images || [])
    }

    loadProduct()
  }, [id])

  // -------------------------
  // IMAGE VALIDATION
  // -------------------------

  function validateImage(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Only images allowed')
      return false
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Max 2MB')
      return false
    }

    return true
  }

  // -------------------------
  // UPLOAD
  // -------------------------

  async function uploadFile(file: File) {
    const fileName = `${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (error) {
      toast.error('Upload failed')
      return null
    }

    return data.path
  }

  // -------------------------
  // DELETE EXISTING IMAGE
  // -------------------------

  async function deleteExistingImage(imageId: string) {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      toast.error('Delete failed')
      return
    }

    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  // -------------------------
  // HANDLE SAVE
  // -------------------------

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let image_url: string | undefined

    // Upload main image
    if (mainImage && validateImage(mainImage)) {
      image_url = (await uploadFile(mainImage)) || undefined
    }

    // Update product
    const { error } = await supabase
      .from('products')
      .update({
        name,
        price,
        description,
        ...(image_url && { image_url }),
      })
      .eq('id', id)

    if (error) {
      toast.error('Update failed')
      setLoading(false)
      return
    }

    // Upload extra images
    for (const file of extraImages) {
      if (!validateImage(file)) continue

      const path = await uploadFile(file)
      if (!path) continue

      await supabase.from('product_images').insert({
        product_id: id,
        image_url: path,
      })
    }

    toast.success('Product updated!')
    setLoading(false)

    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className='max-w-3xl mx-auto space-y-6'>
      <h1 className='text-2xl font-bold'>Edit Product</h1>

      {/* Main Image */}
      <div>
        <p className='font-medium mb-2'>Main Image</p>

        <div className='relative w-full h-48 bg-gray-100 rounded'>
          <Image
            src={mainPreview}
            alt='main'
            fill
            className='object-cover rounded'
          />
        </div>

        <input
          type='file'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && validateImage(file)) {
              setMainImage(file)
              setMainPreview(URL.createObjectURL(file))
            }
          }}
        />
      </div>

      {/* Extra Images */}
      <div>
        <p className='font-medium mb-2'>More Images</p>

        <input
          type='file'
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            const validFiles = files.filter(validateImage)

            setExtraImages(validFiles)
            setExtraPreviews(validFiles.map((f) => URL.createObjectURL(f)))
          }}
        />

        {/* New previews */}
        <div className='flex gap-3 mt-3 flex-wrap'>
          {extraPreviews.map((src, i) => (
            <img key={i} src={src} className='w-20 h-20 object-cover rounded' />
          ))}
        </div>

        {/* Existing images */}
        <div className='flex gap-3 mt-4 flex-wrap'>
          {existingImages.map((img) => {
            const { data } = supabase.storage
              .from('product-images')
              .getPublicUrl(img.image_url)

            return (
              <div key={img.id} className='relative'>
                <img
                  src={data.publicUrl}
                  className='w-20 h-20 object-cover rounded'
                />

                <button
                  type='button'
                  onClick={() => deleteExistingImage(img.id)}
                  className='absolute top-0 right-0 bg-red-500 text-white text-xs px-1'
                >
                  X
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Product name'
        className='w-full border p-3 rounded'
        required
      />

      <input
        type='number'
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder='Price'
        className='w-full border p-3 rounded'
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='Description'
        className='w-full border p-3 rounded'
      />

      {/* Save */}
      <button
        disabled={loading}
        className='bg-[#10b5cb] text-white px-6 py-3 rounded'
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
