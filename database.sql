-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer DEFAULT 1,
  status text DEFAULT 'pending'::text,
  added_at timestamp without time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id),
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  status text DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chats_pkey PRIMARY KEY (id),
  CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT chats_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  vendor_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES auth.users(id),
  CONSTRAINT conversations_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid,
  sender_id uuid,
  message text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  file_url text,
  file_type text,
  is_typing boolean DEFAULT false,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);
CREATE TABLE public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  product_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0::numeric),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  total numeric NOT NULL CHECK (total >= 0::numeric),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'delivered'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  tx_ref text,
  amount numeric,
  status text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  vendor_id uuid,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  stock integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  category text,
  category_id uuid,
  images ARRAY,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  type text NOT NULL,
  target_id uuid,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  product_id uuid,
  vendor_id uuid,
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT reports_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.review_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  review_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT review_likes_pkey PRIMARY KEY (id),
  CONSTRAINT review_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT review_likes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  product_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  full_name text,
  email text UNIQUE,
  role text DEFAULT 'user'::text,
  created_at timestamp without time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.vendor_admin_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vendor_admin_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_admin_conversations_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES auth.users(id)
);
CREATE TABLE public.vendor_admin_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid,
  sender_id uuid,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vendor_admin_messages_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_admin_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.vendor_admin_conversations(id),
  CONSTRAINT vendor_admin_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);
CREATE TABLE public.vendor_ratings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  vendor_id uuid,
  user_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp without time zone DEFAULT now(),
  comment text,
  CONSTRAINT vendor_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_ratings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id),
  CONSTRAINT vendor_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.vendor_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  store_name text,
  phone text,
  location text,
  description text,
  status text DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  license_url text,
  CONSTRAINT vendor_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vendor_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid,
  user_id uuid,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT vendor_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_reviews_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id),
  CONSTRAINT vendor_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  store_name text NOT NULL,
  description text,
  logo_url text,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  latitude numeric,
  longitude numeric,
  email text,
  phone numeric,
  location text,
  banner_url text,
  license_url text,
  rating numeric,
  trial_start timestamp without time zone,
  trial_end timestamp without time zone,
  subscription_status text DEFAULT 'trial'::text,
  message text,
  is_active boolean DEFAULT true,
  category_id uuid,
  CONSTRAINT vendors_pkey PRIMARY KEY (id),
  CONSTRAINT vendors_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.wishlist (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  product_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);