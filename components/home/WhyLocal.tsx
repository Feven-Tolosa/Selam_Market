import { Store, Truck, ShieldCheck, Users } from 'lucide-react'

export default function WhyLocal() {
  const features = [
    {
      icon: Store,
      title: 'Support Local Vendors',
      description: 'Buy directly from trusted vendors in your community.',
    },
    {
      icon: Truck,
      title: 'Fast Local Delivery',
      description: 'Get your products faster with local delivery options.',
    },
    {
      icon: ShieldCheck,
      title: 'Trusted Marketplace',
      description: 'All vendors are verified to ensure safe transactions.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Help grow small businesses and local entrepreneurs.',
    },
  ]

  return (
    <section className='py-20 bg-gray-50'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold'>Why Shop Local?</h2>
          <p className='text-muted-foreground mt-3 max-w-xl mx-auto'>
            Discover the advantages of supporting local businesses and vendors
            in your area.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <div
                key={index}
                className='bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition'
              >
                <div className='w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 mb-4'>
                  <Icon className='w-6 h-6 text-primary' />
                </div>

                <h3 className='font-semibold text-lg mb-2'>{feature.title}</h3>

                <p className='text-sm text-muted-foreground'>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
