'use client'

import { useState } from 'react'
import ReportForm from './ReportForm'

type ReportType = 'product' | 'vendor' | 'platform'

export default function ReportButton({
  type,
  targetId,
}: {
  type: ReportType
  targetId?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='border border-[#10b5cb] text-[#10b5cb] px-6 py-2 rounded'
      >
        Report
      </button>

      {open && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md relative'>
            <button
              onClick={() => setOpen(false)}
              className='absolute top-2 right-2 text-gray-500'
            >
              ✕
            </button>

            <ReportForm
              type={type}
              targetId={targetId}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
