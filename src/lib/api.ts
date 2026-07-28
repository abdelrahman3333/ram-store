import { supabase } from './supabase';
import { Product, SiteSettings } from './dummyData'; // We'll keep the Product interface in dummyData for now

// -----------------------------------------------------------------------------
// Products API
// -----------------------------------------------------------------------------

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  // Transform data to match Product interface (handle snake_case to camelCase)
  return data.map(mapProductFromDB);
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }

  return mapProductFromDB(data);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapProductFromDB(data);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(4);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data.map(mapProductFromDB);
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  if (category === 'All') return getProducts();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }

  return data.map(mapProductFromDB);
};

// -----------------------------------------------------------------------------
// Orders API
// -----------------------------------------------------------------------------

export const createOrder = async (userId: string | null, items: any[], total: number, address: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        items,
        total,
        shipping_address: address,
        status: 'pending',
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  return data;
};

// -----------------------------------------------------------------------------
// Admin / Dashboard API
// -----------------------------------------------------------------------------

export const getDashboardStats = async () => {
  try {
    // 1. Get total revenue (sum of all delivered/shipped orders)
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('total, status');
      
    let totalRevenue = 0;
    let totalOrders = 0;
    if (ordersData && !ordersError) {
      totalOrders = ordersData.length;
      totalRevenue = ordersData.reduce((acc, order) => acc + Number(order.total), 0);
    }

    // 2. Get active products count
    const { count: productsCount, error: pError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 3. Get customers count
    const { count: customersCount, error: cError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      totalRevenue,
      totalOrders,
      totalProducts: productsCount || 0,
      totalCustomers: customersCount || 0,
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 };
  }
};

export const getRecentOrders = async () => {
  const { data: ordersData, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !ordersData) {
    console.error('Error fetching recent orders:', JSON.stringify(error, null, 2), error?.message);
    return [];
  }
  
  // Extract unique user IDs
  const userIds = ordersData
    .map(o => o.user_id)
    .filter((id): id is string => Boolean(id));
    
  if (userIds.length === 0) return ordersData;

  // Fetch profiles for those users
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('id', userIds);

  // Map profiles to orders
  const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
  
  return ordersData.map(order => ({
    ...order,
    profiles: order.user_id ? profilesMap.get(order.user_id) : null
  }));
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const createProduct = async (productData: any) => {
  const { error } = await supabase
    .from('products')
    .insert([productData]);

  if (error) {
    console.error('Error creating product:', JSON.stringify(error, null, 2), error.message);
    throw error;
  }
};

export const updateProduct = async (productId: string, productData: any) => {
  const { error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId);

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const mapProductFromDB = (dbItem: any): Product => ({
  id: dbItem.id,
  name: dbItem.name,
  slug: dbItem.slug,
  collection: dbItem.collection,
  description: dbItem.description,
  price: Number(dbItem.price),
  originalPrice: dbItem.original_price ? Number(dbItem.original_price) : undefined,
  category: dbItem.category,
  sizes: dbItem.sizes || [],
  colors: dbItem.colors || [],
  images: dbItem.images || [],
  stock: dbItem.stock,
  inventory_status: dbItem.inventory_status || 'IN STOCK',
  featured: dbItem.featured,
  badge: dbItem.badge || undefined,
  materials: dbItem.materials || [],
  details: dbItem.details || [],
  sizeAndFit: dbItem.size_and_fit || [],
  shippingAndReturns: dbItem.shipping_and_returns || [],
});

// -----------------------------------------------------------------------------
// Site Settings API
// -----------------------------------------------------------------------------

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching site settings:', error);
    }
    return {
      hero_subtitle: 'ARTIC GRADE MIL-SPEC INSULATION',
      brand_story_title: '[ MATERIAL : GLACIER SPEC ]',
      brand_story_text: 'RAM was born in the mountains. Not as a brand, but as a response.',
      brand_story_quote: 'FOR THOSE WHO CLIMB, NOT FOR THE CROWD.',
      brand_story_image: '/images/mountain-bg.png'
    };
  }

  return data as SiteSettings;
};

export const updateSiteSettings = async (updates: Partial<SiteSettings>): Promise<boolean> => {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 'default', ...updates, updated_at: new Date().toISOString() })
    .eq('id', 'default');

  if (error) {
    console.error('Error updating site settings:', error);
    return false;
  }
  return true;
};
