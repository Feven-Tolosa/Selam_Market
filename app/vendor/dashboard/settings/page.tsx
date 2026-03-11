export default function VendorSettings() {
  return (
    <div>
      <h1 className='text-2xl font-semibold mb-6'>Store Settings</h1>

      <div className='bg-white border rounded-lg p-6 space-y-4'>
        <input placeholder='Store name' className='border p-3 rounded w-full' />

        <textarea
          placeholder='Store description'
          className='border p-3 rounded w-full'
        />

        <button className='bg-[#10b5cb] text-white px-6 py-3 rounded'>
          Save Changes
        </button>
      </div>
    </div>
  )
}
