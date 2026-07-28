-- =============================================
-- RAM E-Commerce — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =============================================
-- Products Table
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  collection TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  inventory_status TEXT DEFAULT 'IN STOCK',
  featured BOOLEAN DEFAULT false,
  badge TEXT,
  materials TEXT[] DEFAULT '{}',
  details TEXT[] DEFAULT '{}',
  size_and_fit TEXT[] DEFAULT '{}',
  shipping_and_returns TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Profiles Table (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Orders Table
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Reviews Table
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Products: Public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are insertable by admins" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Products are updatable by admins" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Products are deletable by admins" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Profiles: Users can read own, admins can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Orders: Users can read own, admins can read all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Reviews: Public read, authenticated users can insert own reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- Seed Data (Products)
-- =============================================
INSERT INTO products (name, slug, description, price, original_price, category, collection, sizes, colors, images, stock, featured, badge, materials, details) VALUES
(
  'ARTIC 01™', 'artic-01',
  'Engineered for sub-zero dominance. Triple-layer insulation with aerogel-infused panels.',
  899.99, 1099.99, 'Puffer Jackets', 'COLLECTION ARTIC 01™',
  ARRAY['S','M','L','XL'],
  '[{"name":"White","hex":"#e8e8e8"},{"name":"Silver","hex":"#a8a8a8"}]'::jsonb,
  ARRAY['/images/hero-model.png','/images/product-white-puffer.png'],
  45, true, 'FLAGSHIP',
  ARRAY['Aerogel-infused panels','Ripstop nylon shell','800-fill goose down'],
  ARRAY['Triple-layer insulation','Wind-proof design','Rated to -40°C']
),
(
  'AURORA™', 'aurora',
  'Glacier aesthetics meets thermal engineering. 700-fill down with reflective panels.',
  1299.00, NULL, 'Down Jackets', 'AURORA SERIES',
  ARRAY['S','M','L','XL','XXL'],
  '[{"name":"Glacier Blue","hex":"#7ba3c9"},{"name":"Ice White","hex":"#e0eaf4"}]'::jsonb,
  ARRAY['/images/product-blue-puffer.png'],
  30, true, 'NEW',
  ARRAY['700-fill duck down','Gradient-dyed nylon','YKK AquaGuard zippers'],
  ARRAY['Polar ice gradient finish','Reflective safety accents']
),
(
  'STEALTH BLACK™', 'stealth-black',
  'Covert ops aesthetics with extreme weather protection.',
  1199.00, NULL, 'Heavy Parkas', 'SHADOW OPS',
  ARRAY['M','L','XL','XXL'],
  '[{"name":"Matte Black","hex":"#1a1a1a"},{"name":"Dark Grey","hex":"#3a3a3a"}]'::jsonb,
  ARRAY['/images/product-black-parka.png'],
  25, true, NULL,
  ARRAY['Gore-Tex Pro shell','900-fill goose down','Cordura reinforcements'],
  ARRAY['Concealed zipper system','Rated to -45°C']
);

-- =============================================
-- Site Settings Table (Homepage Content)
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_bg_image TEXT,
  hero_subtitle TEXT,
  brand_story_title TEXT,
  brand_story_text TEXT,
  brand_story_quote TEXT,
  brand_story_image TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO site_settings (id, hero_bg_image, hero_subtitle, brand_story_title, brand_story_text, brand_story_quote, brand_story_image)
VALUES (
  'default', 
  '', 
  'ARTIC GRADE MIL-SPEC INSULATION', 
  '[ MATERIAL : GLACIER SPEC ]', 
  'RAM was born in the mountains. Not as a brand, but as a response. Every stitch is calibrated for performance, not appearance. Our fabrics are built to endure what others retreat from — sub-zero storms, ice-loaded ridgelines, and the silence between breaths at altitude.',
  'FOR THOSE WHO CLIMB, NOT FOR THE CROWD.',
  '/images/mountain-bg.png'
) ON CONFLICT (id) DO NOTHING;
