'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Product, SiteSettings } from '@/lib/dummyData';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  heroProduct: Product;
  featuredProducts: Product[];
  settings?: SiteSettings;
}

export default function HeroSection({ heroProduct, featuredProducts, settings }: HeroSectionProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredProducts.length]);

  const activeProduct = featuredProducts[currentSlideIndex] || heroProduct;

  const [selectedSize, setSelectedSize] = useState(activeProduct.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(activeProduct.colors[0]?.name || '');
  const [activeImage, setActiveImage] = useState(activeProduct.images[0] || '/images/hero-model.png');
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const { addToCart } = useCart();

  // Initialize loadedImages once activeImage is set
  useEffect(() => {
    if (activeImage && !loadedImages.includes(activeImage)) {
      setLoadedImages(prev => [...prev, activeImage]);
    }
  }, [activeImage, loadedImages]);

  // Reset selections when active product changes
  useEffect(() => {
    if (activeProduct) {
      setSelectedSize(activeProduct.sizes[0]);
      setSelectedColor(activeProduct.colors[0]?.name || '');
      
      // If a custom hero background is set in settings, always use it as default
      if (settings?.hero_bg_image) {
        setActiveImage(settings.hero_bg_image);
      } else {
        // If it's the very first slide and it's the "ARTIC 01", keep the hero-model image as a special case
        if (currentSlideIndex === 0 && activeProduct.name === 'ARTIC 01™') {
          setActiveImage('/images/hero-model.png');
        } else {
          setActiveImage(activeProduct.images[0] || '/images/product-white-puffer.png');
        }
      }
    }
  }, [currentSlideIndex, activeProduct, settings]);

  const handleAddToCart = () => {
    addToCart(activeProduct, selectedSize, selectedColor);
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    const colorIndex = activeProduct.colors.findIndex((c) => c.name === colorName);
    
    // Allow product color thumbnails to override the custom background temporarily when clicked
    if (currentSlideIndex === 0 && colorIndex === 0 && activeProduct.name === 'ARTIC 01™' && !settings?.hero_bg_image) {
      setActiveImage('/images/hero-model.png');
    } else if (colorIndex !== -1 && activeProduct.images[colorIndex]) {
      setActiveImage(activeProduct.images[colorIndex]);
    }
  };

  return (
    <section className={styles.hero} id="hero">
      {/* Background Image */}
      <div className={styles.heroBackground}>
        {loadedImages.map((img) => (
          <Image
            key={img}
            src={img}
            alt={`RAM Hero Background`}
            fill
            priority
            sizes="100vw"
            style={{ 
              objectFit: 'cover', 
              opacity: img === activeImage ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: img === activeImage ? 1 : 0
            }}
          />
        ))}
      </div>

      {/* Overlay */}
      <div className={styles.heroOverlay} />

      {/* Watermark */}
      <div className={styles.heroWatermark}>RAM</div>

      {/* Content */}
      <div className={styles.heroContent}>
        {/* Left Panel */}
        <div className={styles.heroLeft}>
          <p className={styles.heroSubtext}>
            {settings?.hero_subtitle || 'ARTIC GRADE MIL-SPEC INSULATION'}
          </p>

          <h1 className={styles.heroTitle}>
            <span>{activeProduct.collection || 'COLLECTION'}</span>
            <span>{activeProduct.name.toUpperCase()}</span>
          </h1>

          {/* Glass Info Panel */}
          <div className={styles.glassPanel}>
            <div className={styles.panelRow}>
              {/* Size Selector */}
              <div className={styles.panelGroup}>
                <div className={styles.panelLabel}>SIZE</div>
                <div className={styles.sizeOptions}>
                  {activeProduct.sizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeButton} ${selectedSize === size ? styles.active : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className={styles.panelGroup}>
                <div className={styles.panelLabel}>COLOUR</div>
                <div className={styles.colorOptions}>
                  {activeProduct.colors.map((color) => (
                    <div
                      key={color.name}
                      className={`${styles.colorOption} ${selectedColor === color.name ? styles.active : ''}`}
                      onClick={() => handleColorSelect(color.name)}
                    >
                      <span
                        className={styles.colorDot}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className={styles.colorName}>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className={styles.priceRow}>
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                id="hero-add-to-cart"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                ADD TO CART
              </button>

              <div>
                <span className={styles.price}>
                  ${activeProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                {activeProduct.originalPrice && (
                  <span className={styles.priceOld}>
                    ${activeProduct.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Thumbnails */}
        <div className={styles.heroRight}>
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`${styles.thumbnail} ${index === currentSlideIndex ? styles.active : ''}`}
              onClick={() => setCurrentSlideIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <Image
                src={product.images[0] || '/images/product-white-puffer.png'}
                alt={product.name}
                fill
                sizes="100px"
                style={{ objectFit: 'cover' }}
              />
              <span className={styles.thumbnailIndex}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          ))}

          <div className={styles.heroNav}>
            {featuredProducts.map((_, i) => (
              <button
                key={i}
                className={`${styles.heroDot} ${i === currentSlideIndex ? styles.active : ''}`}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrentSlideIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
