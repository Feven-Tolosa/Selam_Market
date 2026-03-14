'use client'

import Link from 'next/link'
import { Users, Store, ShoppingCart, Star } from 'lucide-react'

export default function Sidebar({ active }: { active: string }) {
  const menu = [
    { name: 'Dashboard', href: '/admin', icon: Users },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Vendor Requests', href: '/admin/vendor-requests', icon: Store },
    { name: 'Vendors', href: '/admin/vendors', icon: Store },
    { name: 'Products', href: '/admin/products', icon: ShoppingCart },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
  ]

  return (
    <aside className='w-64 bg-white border-r h-screen sticky top-0'>
      <div className='p-6'>
        <h1 className='text-2xl font-bold text-[#10b5cb]'>Admin Panel</h1>
      </div>
      <nav className='mt-6'>
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = active === item.name
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-6 py-3 hover:bg-[#e6f8fa] transition ${
                isActive
                  ? 'bg-[#10b5cb] text-white rounded-r-lg'
                  : 'text-gray-700'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
