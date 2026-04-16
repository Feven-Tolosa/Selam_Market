type Props = {
  stats: {
    vendors: number
    products: number
    orders: number
  }
}

export default function AdminStats({ stats }: Props) {
  return (
    <div className='grid grid-cols-3 gap-4'>
      <div className='p-4 bg-white rounded-xl shadow'>
        <p className='text-sm text-gray-500'>Vendors</p>
        <h2 className='text-xl font-bold'>{stats.vendors}</h2>
      </div>

      <div className='p-4 bg-white rounded-xl shadow'>
        <p className='text-sm text-gray-500'>Products</p>
        <h2 className='text-xl font-bold'>{stats.products}</h2>
      </div>

      <div className='p-4 bg-white rounded-xl shadow'>
        <p className='text-sm text-gray-500'>Orders</p>
        <h2 className='text-xl font-bold'>{stats.orders}</h2>
      </div>
    </div>
  )
}
