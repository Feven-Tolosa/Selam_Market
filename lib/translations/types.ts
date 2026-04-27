export type Translation = {
  home: string
  vendors: string
  categories: string
  login: string
  register: string

  hero: {
    slide1: {
      title: string
      highlight: string
      description: string
    }
    slide2: {
      title: string
      highlight: string
      description: string
    }
    slide3: {
      title: string
      highlight: string
      description: string
    }
  }

  searchPlaceholder: string
  search: string
  browseProducts: string
  becomeVendor: string

  featured: {
    title: string
    description: string
    loading: string
    empty: string
  }

  vendorOnboarding: {
    title: string
    subtitle: string

    businessName: string
    contactInfo: string
    location: string
    description: string

    licenseTitle: string
    licenseHint: string
    uploadHint: string

    submit: string
    submitting: string

    loginError: string
    licenseError: string
  }
  categoriesSection: {
    badge: string
    title: string
    highlight: string
    description: string
    loading: string
    empty: string
  }
  howItWorks: {
    title: string
    subtitle: string
    step1: {
      title: string
      desc: string
    }
    step2: {
      title: string
      desc: string
    }
    step3: {
      title: string
      desc: string
    }
  }
  availableProducts: {
    title: string
    subtitle: string
    viewAll: string
    empty: string
  }
}
