'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import VendorsTable from '@/components/admin/VendorsTable'
import OrdersTable from '@/components/admin/OrdersTable'
import { Plus, Edit, Trash2, X, Layers } from 'lucide-react'

const Card = ({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: string
}) => (
  <div className='bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition'>
    <p className='text-sm text-gray-500'>{title}</p>
    <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
  </div>
)

type Stats = {
  vendors: number
  products: number
  orders: number
  categories: number
}

type Category = {
  id: string
  name: string
  slug: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    vendors: 0,
    products: 0,
    orders: 0,
    categories: 0,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      const [{ count: vendors }, { count: products }, { count: orders }, { count: categories }] =
        await Promise.all([
          supabase.from('vendors').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
        ])

      setStats({
        vendors: vendors ?? 0,
        products: products ?? 0,
        orders: orders ?? 0,
        categories: categories ?? 0,
      })

      await fetchCategories()
      setLoading(false)
    }

    fetchStats()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error.message)
    } else if (data) {
      setCategories(data)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      if (name === 'name') {
        newData.slug = generateSlug(value)
      }
      return newData
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('You must be logged in to add categories. Please log in and try again.')
      return
    }
    
    setSubmitting(true)
    setError('')

    try {
      if (editingCategory) {
        // Update existing category
        const updateData = {
          name: formData.name.trim(),
          slug: formData.slug,
        }
        
        const { error } = await supabase
          .from('categories')
          .update(updateData)
          .eq('id', editingCategory.id)

        if (error) {
          console.error('Update error details:', error)
          throw new Error(error.message)
        }
        
        alert('Category updated successfully!')
      } else {
        // Create new category
        const insertData = {
          name: formData.name.trim(),
          slug: formData.slug,
        }
        
        console.log('Inserting category:', insertData)
        console.log('User session:', session.user.id)
        
        const { data, error } = await supabase
          .from('categories')
          .insert([insertData])
          .select()

        if (error) {
          console.error('Insert error details:', error)
          throw new Error(error.message)
        }
        
        console.log('Category created successfully:', data)
        alert('Category created successfully!')
      }

      // Reset form and refresh
      setFormData({ name: '', slug: '' })
      setEditingCategory(null)
      setShowCategoryModal(false)
      await fetchCategories()
      
      // Update stats
      const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true })
      setStats(prev => ({ ...prev, categories: count ?? 0 }))
      
    } catch (error: any) {
      console.error('Error saving category:', error)
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        setError('A category with this name already exists')
      } else if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        setError('Permission denied. Please contact your administrator to add categories.')
      } else if (error.message?.includes('permission')) {
        setError('You don\'t have permission to add categories.')
      } else {
        setError(`Error: ${error.message}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
    })
    setError('')
    setShowCategoryModal(true)
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error
      
      alert('Category deleted successfully!')
      await fetchCategories()
      
      const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true })
      setStats(prev => ({ ...prev, categories: count ?? 0 }))
      
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert(`Error deleting category: ${error.message}`)
    }
  }

  const closeModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '' })
    setError('')
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
        <p className='text-gray-500 text-sm'>
          Overview of your marketplace activity
        </p>
        {!isAuthenticated && (
          <div className='mt-2 p-2 bg-yellow-50 text-yellow-700 text-sm rounded-lg'>
            ⚠️ You are not logged in. Some features may be limited.
          </div>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className='text-gray-500'>Loading stats...</div>
      ) : (
        <div className='grid md:grid-cols-4 gap-4 mb-6'>
          <Card
            title='Total Vendors'
            value={stats.vendors}
            color='text-blue-600'
          />
          <Card
            title='Total Products'
            value={stats.products}
            color='text-green-600'
          />
          <Card
            title='Total Orders'
            value={stats.orders}
            color='text-purple-600'
          />
          <Card
            title='Total Categories'
            value={stats.categories}
            color='text-[#10b5cb]'
          />
        </div>
      )}

      {/* Categories Management Section */}
      <div className='bg-white rounded-xl shadow-sm mb-6 overflow-hidden'>
        <div className='flex items-center justify-between p-4 border-b border-gray-100'>
          <div className='flex items-center gap-2'>
            <Layers className='w-5 h-5 text-[#10b5cb]' />
            <h2 className='font-semibold text-gray-700'>Manage Categories</h2>
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className='flex items-center gap-2 bg-[#10b5cb] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0e9db0] transition'
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        <div className='p-4'>
          {categories.length === 0 ? (
            <div className='text-center py-8 text-gray-400'>
              <Layers className='w-12 h-12 mx-auto mb-2 opacity-50' />
              <p>No categories yet. Click "Add Category" to create one.</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left p-3 text-xs font-medium text-gray-500 uppercase'>Name</th>
                    <th className='text-left p-3 text-xs font-medium text-gray-500 uppercase'>Slug</th>
                    <th className='text-left p-3 text-xs font-medium text-gray-500 uppercase'>Created</th>
                    <th className='text-left p-3 text-xs font-medium text-gray-500 uppercase'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className='border-b border-gray-100 hover:bg-gray-50 transition'>
                      <td className='p-3 text-sm font-medium text-gray-700'>{category.name}</td>
                      <td className='p-3 text-sm text-gray-500'>{category.slug}</td>
                      <td className='p-3 text-sm text-gray-500'>
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className='p-3'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEdit(category)}
                            className='p-1 text-blue-500 hover:bg-blue-50 rounded transition'
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className='p-1 text-red-500 hover:bg-red-50 rounded transition'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tables Section */}
      <div className='grid lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-sm p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='font-semibold text-gray-700'>Recent Vendors</h2>
          </div>
          <VendorsTable />
        </div>

        <div className='bg-white rounded-xl shadow-sm p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='font-semibold text-gray-700'>Recent Orders</h2>
          </div>
          <OrdersTable />
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h3 className='text-lg font-semibold text-gray-800'>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={closeModal}
                className='p-1 hover:bg-gray-100 rounded transition'
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-4 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#10b5cb] focus:border-transparent'
                  placeholder='e.g., Electronics, Clothing, Cosmetics'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Slug (URL-friendly name)
                </label>
                <input
                  type='text'
                  name='slug'
                  value={formData.slug}
                  readOnly
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500'
                />
                <p className='text-xs text-gray-400 mt-1'>Auto-generated from category name</p>
              </div>

              {error && (
                <div className='text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200'>
                  ✖ {error}
                </div>
              )}

              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='flex-1 bg-[#10b5cb] text-white rounded-lg px-4 py-2 hover:bg-[#0e9db0] transition disabled:opacity-50'
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}