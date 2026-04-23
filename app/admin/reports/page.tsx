'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Report = {
  id: string
  type: string
  reason: string
  description: string
  status: string
  created_at: string
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setReports(data)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    fetchReports()
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Reports</h1>

      <div className='space-y-4'>
        {reports.map((r) => (
          <div key={r.id} className='border p-4 rounded'>
            <p>
              <strong>Type:</strong> {r.type}
            </p>
            <p>
              <strong>Reason:</strong> {r.reason}
            </p>
            <p>{r.description}</p>
            <p className='text-sm text-gray-500'>{r.created_at}</p>

            <div className='flex gap-2 mt-2'>
              <button onClick={() => updateStatus(r.id, 'reviewed')}>
                Review
              </button>
              <button onClick={() => updateStatus(r.id, 'resolved')}>
                Resolve
              </button>
              <button onClick={() => updateStatus(r.id, 'rejected')}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
