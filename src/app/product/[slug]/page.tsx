'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/dummyData';
import { getProductBySlug, getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard/ProductCard';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug ? decodeURIComponent(params.slug as string) : '';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const { addToCart } = useCart();

  // Ratings State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [user, setUser] = useState<any>(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      const p = await getProductBySlug(slug);
      setProduct(p);
      
      if (p) {
        setAverageRating(p.rating || 4.8);
        const allProducts = await getProducts();
        setRelatedProducts(allProducts.filter(item => item.id !== p.id).slice(0, 4));
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  // Fetch reviews and user
  useEffect(() => {
    if (!product) return;
    
    const fetchAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        setReviews(data);
        if (data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAverageRating(avg);
        }
      }
    };

    fetchAuth();
    fetchReviews();
  }, [product]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    
    setIsSubmittingReview(true);
    setReviewError('');

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          product_id: product.id,
          user_id: user.id,
          rating: newReviewRating,
          comment: newReviewComment
        }
      ])
      .select();

    setIsSubmittingReview(false);

    if (error) {
      setReviewError(error.message);
    } else if (data) {
      const newReviews = [data[0], ...reviews];
      setReviews(newReviews);
      const avg = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
      setAverageRating(avg);
      setNewReviewComment('');
    }
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    if (!product) return;
    const colorObj = product.colors.find((c) => c.name === colorName);
    if (colorObj && colorObj.images && colorObj.images.length > 0) {
      const firstColorImage = colorObj.images[0];
      const index = (product.images || []).findIndex(img => img === firstColorImage);
      if (index !== -1) {
        setActiveImage(index);
      } else {
        setActiveImage(0);
      }
    } else {
      setActiveImage(0);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 style={{ paddingTop: '2rem' }}>Loading product...</h1>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 style={{ paddingTop: '2rem' }}>Product not found</h1>
          <Link href="/" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-small)' }}>
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    );
  }

  const currentSize = selectedSize || product.sizes[0];
  const currentColor = selectedColor || product.colors[0]?.name;

  const displayImages = product.images || [];

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const tabs = ['details', 'materials', 'size & fit', 'shipping & returns', 'reviews'];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">HOME</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/#products">CATALOG</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className={styles.productLayout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.galleryThumbs}>
              {displayImages.map((img, i) => (
                <div
                  key={i}
                  className={`${styles.galleryThumb} ${activeImage === i ? styles.active : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill sizes="70px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            <div className={styles.galleryMain}>
              {displayImages[activeImage] && (
                <Image
                  src={displayImages[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className={styles.infoPanel}>
            {product.badge && <span className={styles.badge}>{product.badge}</span>}

            <div>
              <h1 className={styles.productName}>{product.name}</h1>
              <p className={styles.collectionName}>{product.collection}</p>
            </div>

            {/* Rating */}
            <div className={styles.rating}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFull = averageRating >= star;
                  const isPartial = averageRating > star - 1 && averageRating < star;
                  const fillPercentage = isPartial ? (averageRating % 1) * 100 : 0;
                  
                  return (
                    <div key={star} style={{ position: 'relative', display: 'inline-flex', width: 16, height: 16 }}>
                      {/* Empty star outline */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {/* Filled star (clipped) */}
                      {(isFull || isPartial) && (
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', clipPath: isPartial ? `inset(0 ${100 - fillPercentage}% 0 0)` : 'none' }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className={styles.ratingText} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('reviews')}>
                {averageRating.toFixed(1)} ({reviews.length > 0 ? reviews.length : product.reviewsCount || 128} reviews)
              </span>
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>
                ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              {product.originalPrice && (
                <>
                  <span className={styles.priceOld}>
                    ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={styles.discount}>{discount}% OFF</span>
                </>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Color Selector */}
            <div className={styles.selectorGroup}>
              <div className={styles.selectorHeader}>
                <span className={styles.selectorLabel}>Color: {currentColor}</span>
              </div>
              <div className={styles.colorOptions}>
                {product.colors.map((color) => (
                  <div
                    key={color.name}
                    className={`${styles.colorOption} ${currentColor === color.name ? styles.active : ''}`}
                    onClick={() => handleColorSelect(color.name)}
                  >
                    <span className={styles.colorDot} style={{ backgroundColor: color.hex }} />
                    <span className={styles.colorLabel}>{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className={styles.selectorGroup}>
              <div className={styles.selectorHeader}>
                <span className={styles.selectorLabel}>Size: {currentSize}</span>
                <span className={styles.sizeGuide}>↗ SIZE GUIDE</span>
              </div>
              <div className={styles.sizeGrid}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`${styles.sizeBtn} ${currentSize === size ? styles.active : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                className={styles.addToCartBtn}
                onClick={() => addToCart(product, currentSize, currentColor)}
                id="pdp-add-to-cart"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                ADD TO CART
              </button>
              <button className={styles.wishlistBtn} id="pdp-wishlist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            {/* Perks */}
            <div className={styles.perks}>
              <div className={styles.perk}>
                <svg className={styles.perkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <div className={styles.perkInfo}>
                  <span className={styles.perkTitle}>FREE SHIPPING</span>
                  <span className={styles.perkDesc}>On orders over $500</span>
                </div>
              </div>
              <div className={styles.perk}>
                <svg className={styles.perkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
                <div className={styles.perkInfo}>
                  <span className={styles.perkTitle}>EASY RETURNS</span>
                  <span className={styles.perkDesc}>30-day return policy</span>
                </div>
              </div>
              <div className={styles.perk}>
                <svg className={styles.perkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div className={styles.perkInfo}>
                  <span className={styles.perkTitle}>SECURE PAYMENT</span>
                  <span className={styles.perkDesc}>100% secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className={styles.tabsSection}>
          <div className={styles.tabsHeader}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={styles.tabContent} style={activeTab === 'reviews' ? { gridTemplateColumns: '1fr' } : {}}>
            <div className={styles.detailsList}>
              {activeTab === 'details' &&
                product.details?.map((detail, i) => (
                  <div key={i} className={styles.detailItem}>
                    <span className={styles.detailIcon} />
                    {detail}
                  </div>
                ))}
              {activeTab === 'materials' &&
                product.materials?.map((mat, i) => (
                  <div key={i} className={styles.detailItem}>
                    <span className={styles.detailIcon} />
                    {mat}
                  </div>
                ))}
              {activeTab === 'size & fit' && (
                product.sizeAndFit && product.sizeAndFit.length > 0 ? (
                  product.sizeAndFit.map((item, i) => (
                    <div key={i} className={styles.detailItem}>
                      <span className={styles.detailIcon} />
                      {item}
                    </div>
                  ))
                ) : (
                  <>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Oversized fit — size down for regular fit</div>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Model is 6&apos;1&quot; wearing size L</div>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Chest: S(40&quot;) M(42&quot;) L(44&quot;) XL(46&quot;) XXL(48&quot;)</div>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Length: S(28&quot;) M(29&quot;) L(30&quot;) XL(31&quot;) XXL(32&quot;)</div>
                  </>
                )
              )}
              {activeTab === 'shipping & returns' && (
                product.shippingAndReturns && product.shippingAndReturns.length > 0 ? (
                  product.shippingAndReturns.map((item, i) => (
                    <div key={i} className={styles.detailItem}>
                      <span className={styles.detailIcon} />
                      {item}
                    </div>
                  ))
                ) : (
                  <>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Free shipping on orders over $500</div>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Standard delivery: 5-7 business days</div>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Express delivery: 2-3 business days (+$25)</div>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />30-day return policy for unworn items</div>
                    <div className={styles.detailItem}><span className={styles.detailIcon} />Free returns on all domestic orders</div>
                  </>
                )
              )}
              
              {activeTab === 'reviews' && (
                <div style={{ maxWidth: '800px', width: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-small)', marginBottom: 'var(--space-xl)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase' }}>
                    Customer Reviews
                  </h3>

                  {/* Review Form */}
                  <div style={{ marginBottom: 'var(--space-3xl)', padding: 'var(--space-xl)', background: 'rgba(168, 200, 232, 0.05)', borderRadius: 'var(--radius-lg)' }}>
                    {user ? (
                      <form onSubmit={handleReviewSubmit}>
                        <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', marginBottom: 'var(--space-md)', letterSpacing: 'var(--ls-widest)', textTransform: 'uppercase' }}>Leave a Review</h4>
                        
                        {reviewError && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--fs-xs)', marginBottom: 'var(--space-sm)' }}>{reviewError}</p>}
                        
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg 
                                key={star} 
                                viewBox="0 0 24 24" 
                                width="24" 
                                height="24"
                                fill={newReviewRating >= star ? 'var(--color-accent)' : 'none'} 
                                stroke={newReviewRating >= star ? 'var(--color-accent)' : 'currentColor'} 
                                strokeWidth="1"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setNewReviewRating(star)}
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                        </div>

                        <textarea 
                          style={{ width: '100%', minHeight: '80px', background: 'rgba(26, 42, 58, 0.5)', border: '1px solid rgba(168, 200, 232, 0.15)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)', color: 'var(--color-frost-white)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', marginBottom: 'var(--space-md)', resize: 'vertical' }}
                          placeholder="What did you think about this product?"
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                        />

                        <button 
                          type="submit" 
                          disabled={isSubmittingReview}
                          style={{ padding: 'var(--space-sm) var(--space-xl)', background: 'var(--color-accent)', color: 'var(--color-deep-slate)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: 'var(--radius-md)', border: 'none', cursor: isSubmittingReview ? 'not-allowed' : 'pointer', opacity: isSubmittingReview ? 0.7 : 1 }}
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    ) : (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--color-slate-light)' }}>
                        Please <Link href="/auth/login" style={{ color: 'var(--color-accent)' }}>log in</Link> to leave a review.
                      </p>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {reviews.length === 0 ? (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--color-slate-light)' }}>No reviews yet. Be the first to review this product!</p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} style={{ borderBottom: '1px solid rgba(168, 200, 232, 0.1)', paddingBottom: 'var(--space-xl)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                            <div style={{ display: 'flex', gap: '2px', color: 'var(--color-accent)' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} viewBox="0 0 24 24" width="12" height="12" fill={review.rating >= star ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-slate-light)', letterSpacing: 'var(--ls-wide)' }}>
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p style={{ fontSize: 'var(--fs-small)', color: 'var(--color-ghost-white)', lineHeight: '1.6' }}>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>You May Also Like</h2>
            <Link href="/#products" className={styles.relatedViewAll}>VIEW ALL →</Link>
          </div>

          <div className={styles.relatedGrid}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
