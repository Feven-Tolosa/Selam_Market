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

  categoryPage: {
    title: string
    loading: string
    empty: string
  }

  featured: {
    title: string
    description: string
    loading: string
    empty: string
  }
}
