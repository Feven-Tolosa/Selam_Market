'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type ReportType = 'product' | 'vendor' | 'platform'

export default function ReportForm({
  type,
  targetId,
  onSuccess,
}: {
  type: ReportType
  targetId?: string
  onSuccess?: () => void
}) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const submitReport = async () => {
    if (!reason) {
      toast.error('Select a reason')
      return
    }

    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('reports').insert({
      user_id: userData.user?.id,
      type,
      target_id: targetId || null,
      reason,
      description,
    })

    setLoading(false)

    if (error) {
      toast.error('Failed to submit report')
      console.error(error)
    } else {
      toast.success('Report submitted')
      setReason('')
      setDescription('')
      onSuccess?.()
    }
  }

  return (
    <div className='space-y-3'>
      <h3 className='font-semibold'>Report Issue</h3>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className='w-full border p-2 rounded'
      >
        <option value=''>Select reason</option>
        <option value='spam'>Spam</option>
        <option value='fake'>Fake listing</option>
        <option value='abuse'>Abuse</option>
        <option value='bug'>Bug</option>
        <option value='other'>Other</option>
      </select>

      <textarea
        placeholder='Describe the issue...'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className='w-full border p-2 rounded'
      />

      <button
        onClick={submitReport}
        disabled={loading}
        className='bg-red-500 text-white px-4 py-2 rounded w-full'
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  )
}
