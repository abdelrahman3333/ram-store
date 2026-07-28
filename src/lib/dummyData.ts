export interface ProductColor {
  name: string;
  hex: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  stock: number;
  featured: boolean;
  inventory_status?: string;
  badge?: string;
  materials?: string[];
  details?: string[];
  sizeAndFit?: string[];
  shippingAndReturns?: string[];
  rating?: number;
  reviewsCount?: number;
}

export interface SiteSettings {
  id?: string;
  hero_bg_image?: string;
  hero_subtitle?: string;
  brand_story_title?: string;
  brand_story_text?: string;
  brand_story_quote?: string;
  brand_story_image?: string;
  updated_at?: string;
}

export const categories = [
  'All',
  'Puffer Jackets',
  'Down Jackets',
  'Heavy Parkas',
  'Tech Parkas',
  'Cargo Jackets',
  'Expedition Coats',
  'Extreme Cold Suits',
];
