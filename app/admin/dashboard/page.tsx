import { supabase } from '@/lib/supabaseClient'

export default async function AdminDashboard() {
  const { data: requests } = await supabase
    .from('vendor_requests')
    .select('*')
    .eq('status', 'pending')

  {
    /* Approve Vendor Request */
  }
  async function approveVendor(formData: FormData) {
    'use server'

    const requestId = formData.get('requestId') as string

    const { data: request } = await supabase
      .from('vendor_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!request) return

    await supabase.from('vendors').insert({
      user_id: request.user_id,
      store_name: request.store_name,
      phone: request.phone,
      location: request.location,
      description: request.description,
    })

    await supabase
      .from('vendor_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
  }

  {
    /* Reject Vendor Request */
  }
  async function rejectVendor(formData: FormData) {
    'use server'

    const requestId = formData.get('requestId') as string

    await supabase
      .from('vendor_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
  }

  return (
    <div className='p-10'>
      <h1 className='text-2xl font-bold mb-6'>Vendor Requests</h1>

      <div className='space-y-4'>
        {requests?.map((req) => (
          <div
            key={req.id}
            className='border rounded-xl p-6 flex justify-between'
          >
            <div>
              <h2 className='font-semibold'>{req.store_name}</h2>

              <p className='text-sm text-gray-500'>{req.location}</p>
            </div>

            <div className='flex gap-4'>
              <form action={approveVendor}>
                <input type='hidden' name='requestId' value={req.id} />

                <button className='bg-green-500 text-white px-4 py-2 rounded'>
                  Approve
                </button>
              </form>

              <form action={rejectVendor}>
                <input type='hidden' name='requestId' value={req.id} />

                <button className='bg-red-500 text-white px-4 py-2 rounded'>
                  Reject
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
