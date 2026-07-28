'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      // Mock address for now (since we don't have form state binding yet)
      const address = {
        firstName: 'Test',
        lastName: 'User',
        address: '123 Arctic St',
        city: 'Anchorage',
        postalCode: '99501',
        country: 'US',
      };
      
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        price: item.product.price
      }));

      const shipping = totalPrice < 500 ? 25 : 0;
      const tax = totalPrice * 0.08;
      const finalTotal = totalPrice + shipping + tax;

      await createOrder(user?.id || null, orderItems, finalTotal, address);
      
      clearCart();
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.container} style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2 style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>ORDER PLACED SUCCESSFULLY!</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-ghost-white)' }}>Redirecting you to the home page...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.container}>
          <div className={styles.emptyCheckout}>
            <h2>YOUR BAG IS EMPTY</h2>
            <Link href="/">← CONTINUE SHOPPING</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Checkout</h1>

        <div className={styles.checkoutGrid}>
          {/* Form */}
          <div className={styles.formSection}>
            {/* Contact */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionLabel}>
                <span>1</span> CONTACT INFORMATION
              </h2>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.formLabel}>EMAIL</label>
                  <input type="email" className={styles.formInput} placeholder="your@email.com" id="checkout-email" defaultValue={user?.email || ''} />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionLabel}>
                <span>2</span> SHIPPING ADDRESS
              </h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>FIRST NAME</label>
                  <input type="text" className={styles.formInput} placeholder="JOHN" id="checkout-first-name" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>LAST NAME</label>
                  <input type="text" className={styles.formInput} placeholder="DOE" id="checkout-last-name" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.formLabel}>ADDRESS</label>
                  <input type="text" className={styles.formInput} placeholder="123 ARCTIC STREET" id="checkout-address" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CITY</label>
                  <input type="text" className={styles.formInput} placeholder="ANCHORAGE" id="checkout-city" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>POSTAL CODE</label>
                  <input type="text" className={styles.formInput} placeholder="99501" id="checkout-postal" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.formLabel}>COUNTRY</label>
                  <input type="text" className={styles.formInput} placeholder="UNITED STATES" id="checkout-country" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionLabel}>
                <span>3</span> PAYMENT METHOD
              </h2>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.formLabel}>CARD NUMBER</label>
                  <input type="text" className={styles.formInput} placeholder="4242 4242 4242 4242" id="checkout-card" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>EXPIRY</label>
                  <input type="text" className={styles.formInput} placeholder="MM / YY" id="checkout-expiry" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CVC</label>
                  <input type="text" className={styles.formInput} placeholder="123" id="checkout-cvc" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>ORDER SUMMARY</h2>

              {items.map((item) => (
                <div
                  className={styles.summaryItem}
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                >
                  <div className={styles.summaryItemImage}>
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="60px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <h4 className={styles.summaryItemName}>{item.product.name}</h4>
                    <p className={styles.summaryItemMeta}>
                      {item.selectedSize} · {item.selectedColor} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className={styles.summaryItemPrice}>
                    ${(item.product.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}

              <div className={styles.summaryTotals}>
                <div className={styles.summaryRow}>
                  <span>SUBTOTAL</span>
                  <span>${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>SHIPPING</span>
                  <span>{totalPrice >= 500 ? 'FREE' : '$25.00'}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>TAX</span>
                  <span>${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>TOTAL</span>
                  <span>
                    ${(totalPrice + (totalPrice < 500 ? 25 : 0) + totalPrice * 0.08).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button 
                className={styles.placeOrderBtn} 
                onClick={handlePlaceOrder}
                disabled={loading}
                id="place-order"
              >
                {loading ? 'PROCESSING...' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
