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
  whyLocal: {
    badge: string
    title: string
    subtitle: string

    features: {
      support: {
        title: string
        desc: string
      }
      delivery: {
        title: string
        desc: string
      }
      secure: {
        title: string
        desc: string
      }
      community: {
        title: string
        desc: string
      }
    }

    stats: {
      vendors: string
      customers: string
      support: string
      satisfaction: string
    }
  }
  productCard: {
    topRated: string
  }
  topDeals: {
    title: string
    subtitle: string
    loading: string
  }
  newsletter: {
    title: string
    subtitle: string
    placeholder: string
    button: string

    emailRequired: string
    invalidEmail: string
    success: string
    error: string
  }
  footer: {
    marketplace: string
    forVendors: string
    support: string

    browseProducts: string
    categories: string
    vendors: string

    becomeVendor: string
    vendorDashboard: string
    vendorGuide: string

    helpCenter: string
    contactUs: string
    privacyPolicy: string

    appStore: string
    googlePlay: string

    location: string
    copyright: string
  }
}
