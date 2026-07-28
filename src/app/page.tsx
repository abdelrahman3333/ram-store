import HeroSection from '@/components/HeroSection/HeroSection';
import NewCollection from '@/components/NewCollection/NewCollection';
import BrandStory from '@/components/BrandStory/BrandStory';
import { getFeaturedProducts, getProducts, getSiteSettings } from '@/lib/api';

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const allProducts = await getProducts();
  const settings = await getSiteSettings();

  return (
    <>
      {featuredProducts.length > 0 && <HeroSection heroProduct={featuredProducts[0]} featuredProducts={featuredProducts} settings={settings} />}
      <NewCollection products={allProducts} />
      <BrandStory settings={settings} />
    </>
  );
}
