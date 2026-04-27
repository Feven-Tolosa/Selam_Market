'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

/* ---------- TYPES ---------- */

type RawReport = {
  id: string
  type: 'product' | 'vendor' | 'platform'
  reason: string
  description: string | null
  created_at: string
  product_id: string | null
  vendor_id: string | null

  product: { id: string; name: string; image_url: string | null }[]
  vendor: { id: string; business_name: string }[]
}

type Report = {
  id: string
  type: 'product' | 'vendor' | 'platform'
  reason: string
  description: string | null
  created_at: string
  product_id: string | null
  vendor_id: string | null

  product: { id: string; name: string; image_url: string | null } | null
  vendor: { id: string; business_name: string } | null
}

/* ---------- PAGE ---------- */

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [hovered, setHovered] = useState<Report | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select(
        `
        *
      `,
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    const normalized: Report[] = (data as RawReport[]).map((r) => ({
      ...r,
      product: r.product?.[0] || null,
      vendor: r.vendor?.[0] || null,
    }))

    setReports(normalized)
  }

  const getHref = (r: Report) => {
    if (r.type === 'product')
      return `/products/${r.product?.id || r.product_id}`

    if (r.type === 'vendor') return `/vendor/${r.vendor?.id || r.vendor_id}`

    return '#'
  }

  const getSource = (type: Report['type']) => {
    if (type === 'product') return 'Product Report'
    if (type === 'vendor') return 'Vendor Report'
    return 'Platform Issue'
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Reports</h1>

      <div className='space-y-4'>
        {reports.map((r) => (
          <Link
            key={r.id}
            href={getHref(r)}
            onMouseEnter={() => setHovered(r)}
            onMouseLeave={() => setHovered(null)}
            className='block bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition'
          >
            <p className='text-xs text-gray-500'>{getSource(r.type)}</p>

            <p className='font-medium capitalize'>{r.reason}</p>

            <p className='text-sm text-gray-400'>
              {new Date(r.created_at).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      {/* 🔥 HOVER PREVIEW PANEL */}
      {hovered && <PreviewPanel report={hovered} />}
    </div>
  )
}

/* ---------- PREVIEW PANEL ---------- */

function PreviewPanel({ report }: { report: Report }) {
  return (
    <div className='fixed right-6 bottom-6 w-80 bg-white border rounded-xl shadow-lg p-4 space-y-3 z-50'>
      <h3 className='font-semibold text-sm'>Preview</h3>

      {/* PRODUCT */}
      {report.type === 'product' && report.product && (
        <>
          <Image
            src={report.product.image_url || '/placeholder.png'}
            alt=''
            width={60}
            height={60}
            className='rounded'
          />
          <p className='font-medium'>{report.product.name}</p>
        </>
      )}

      {/* VENDOR */}
      {report.type === 'vendor' && report.vendor && (
        <>
          <div className='w-12 h-12 bg-gray-200 rounded flex items-center justify-center'>
            🏪
          </div>
          <p className='font-medium'>{report.vendor.business_name}</p>
        </>
      )}

      {/* PLATFORM */}
      {report.type === 'platform' && (
        <p className='text-sm text-gray-500'>Platform issue</p>
      )}

      {/* DETAILS */}
      <p className='text-sm text-gray-600'>
        {report.description || 'No description'}
      </p>
    </div>
  )
}
