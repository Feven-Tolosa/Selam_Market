import { Translation } from './types'

export const en: Translation = {
  home: 'Home',
  vendors: 'Vendors',
  categories: 'Categories',
  login: 'Login',
  register: 'Register',

  hero: {
    slide1: {
      title: 'Discover products from',
      highlight: ' local vendors',
      description:
        'Explore thousands of products from trusted sellers in your area.',
    },
    slide2: {
      title: 'Shop fresh and quality',
      highlight: ' marketplace deals',
      description:
        'Find amazing discounts and support small businesses near you.',
    },
    slide3: {
      title: 'Grow your business as a',
      highlight: ' trusted vendor',
      description: 'Join our platform and reach thousands of customers today.',
    },
  },

  searchPlaceholder: 'Search products...',
  search: 'Search',
  browseProducts: 'Browse Products',
  becomeVendor: 'Become a Vendor',
  categoryPage: {
    title: 'Browse Categories',
    loading: 'Loading categories...',
    empty: 'No categories found',
  },

  featured: {
    title: 'Featured Products',
    description:
      'Discover our top-rated products from trusted vendors. Handpicked for you!',
    loading: 'Loading featured products...',
    empty: 'No featured products found.',
  },

  vendorOnboarding: {
    title: 'Become a Vendor',
    subtitle: 'Register your business',

    businessName: 'Business Name',
    contactInfo: 'Contact Info',
    location: 'Location',
    description: 'Description',

    licenseTitle: 'Business License (Upload - Max 5MB)',
    licenseHint: 'Click to upload or scan',
    uploadHint: 'JPG, PNG, or PDF',

    submit: 'Request Vendor Account',
    submitting: 'Submitting...',

    loginError: 'You must be logged in',
    licenseError: 'Please upload your business license',
  },
}
