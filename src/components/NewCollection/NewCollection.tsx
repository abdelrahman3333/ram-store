'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Product, categories } from '@/lib/dummyData';
import ProductCard from '../ProductCard/ProductCard';
import styles from './NewCollection.module.css';

interface NewCollectionProps {
  products: Product[];
}

export default function NewCollection({ products }: NewCollectionProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart } = useCart();

  const featuredProduct = products.length > 1 ? products[1] : products[0]; // AURORA or fallback

  if (!featuredProduct) return null;

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <section className={styles.section} id="collection">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>New Collection</h2>
        <div className={styles.sectionNav}>
          {['ALL', 'PUFFERS', 'PARKAS', 'TECH COATS'].map((nav) => (
            <span
              key={nav}
              className={`${styles.sectionNavLink} ${nav === 'ALL' ? styles.active : ''}`}
            >
              {nav}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Banner */}
      <div className={styles.featuredBanner}>
        <div className={styles.bannerInner}>
          <div className={styles.bannerWatermark}>RAM</div>

          <div className={styles.bannerImage}>
            <Image
              src={featuredProduct.images[0]}
              alt={featuredProduct.name}
              fill
              sizes="280px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className={styles.bannerContent}>
            <span className={styles.bannerBadge}>{featuredProduct.badge || 'FEATURED'}</span>
            <h3 className={styles.bannerName}>{featuredProduct.name}</h3>
            <div className={styles.bannerMeta}>
              <button
                className={styles.bannerCartBtn}
                onClick={() => addToCart(featuredProduct, 'M', featuredProduct.colors[0].name)}
                id="featured-add-to-cart"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                ADD TO CART
              </button>
              <span className={styles.bannerPrice}>
                ${featuredProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className={styles.gridContainer} id="products">
        <div className={styles.gridHeader}>
          <div />
          <button
            className={styles.filterBtn}
            onClick={() => setFilterOpen(!filterOpen)}
            id="filter-toggle"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            FILTERS
          </button>
        </div>

        {/* Filter Chips */}
        <div className={`${styles.filterDropdown} ${filterOpen ? styles.open : ''}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterChip} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
