### Selam Marketplace

A modern marketplace for Ethiopian products, connecting local vendors with customers worldwide. Built with Next.js, Supabase, and a modern React stack.

# Features

Multi-vendor marketplace
Real-time chat overlay for vendors and customers
Vendor dashboard with trial management
Product listing with category filtering
Cart system supporting multi-vendor orders
Notifications via react-hot-toast
Fully responsive UI
Server-Side Rendering (SSR) with hydration-safe fonts

# 🛠 Tech Stack

Framework: Next.js 13 (App Router)
UI & Fonts: Next.js Google Fonts (JetBrains Mono, Geist, Geist Mono)
Backend: Supabase (Auth, Database, Realtime)
Styling: Tailwind CSS
State Management: React Context (VendorProvider)
Notifications: react-hot-toast
Image Handling: Next.js Image component

# 📦 Project Structure

/app
/products
/layout.tsx # Root layout with fonts, navbar, and providers
/components
/layout
Navbar.tsx
/chat
ChatOverlay.tsx
/lib
VendorContext.tsx
supabaseClient.ts
utils.ts
/pages (if using any pages route)

# ⚡ Getting Started

1. Clone the repo
   git clone https://github.com/yourusername/selam-marketplace.git
   cd selam-marketplace
2. Install dependencies
   npm install

# or

yarn 3. Setup environment variables
Create a .env.local file at the root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key 4. Run the development server
npm run dev

# or

yarn dev

Visit http://localhost:3000
to view the app.

# 🛒 Cart & Vendor Features

Cart supports multi-vendor orders
Vendors can set trial periods and receive payment notifications
Vendors and customers can chat in real-time via the overlay
