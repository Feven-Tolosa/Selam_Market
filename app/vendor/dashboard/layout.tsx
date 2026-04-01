import Link from 'next/link'

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <aside className='w-64 bg-white border-r sticky top-0 h-screen'>
        <div className='p-6 border-b'>
          <h2 className='font-semibold text-lg text-[#10b5cb]'>Vendor Panel</h2>
        </div>

        <nav className='p-4 space-y-2'>
          <Link
            href='/vendor/dashboard'
            className='block px-4 py-2 rounded hover:bg-[#10b5cb]/10'
          >
            Profile
          </Link>

          <Link
            href='/vendor/dashboard/products'
            className='block px-4 py-2 rounded hover:bg-[#10b5cb]/10'
          >
            My Products
          </Link>

          <Link
            href='/vendor/dashboard/orders'
            className='block px-4 py-2 rounded hover:bg-[#10b5cb]/10'
          >
            Orders
          </Link>

          <Link
            href='/vendor/dashboard/settings'
            className='block px-4 py-2 rounded hover:bg-[#10b5cb]/10'
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className='flex-1 p-10'>{children}</main>
    </div>
  )
}
