'use client'

import { useParams } from 'next/navigation'

export default function VendorProfilePage() {
  const { id } = useParams()

  return <div>Vendor ID: {id}</div>
}
