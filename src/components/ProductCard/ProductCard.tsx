'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/dummyData';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className={styles.card} id={`product-card-${product.id}`}>
      <div className={styles.imageWrap}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          style={{ objectFit: 'cover' }}
        />
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.collection}>{product.category}</p>

        <div className={styles.colorDots}>
          {product.colors.map((color) => (
            <span
              key={color.name}
              className={styles.dot}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>

        <div className={styles.price}>
          ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          {product.originalPrice && (
            <span className={styles.priceOld}>
              ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
