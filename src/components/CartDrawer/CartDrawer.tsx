'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice, totalItems, updateQuantity, removeFromCart } =
    useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.title}>YOUR BAG</span>
            <span className={styles.itemCount}>({totalItems})</span>
          </div>
          <button className={styles.closeBtn} onClick={closeCart} id="cart-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className={styles.emptyText}>YOUR BAG IS EMPTY</span>
            </div>
          ) : (
            items.map((item) => (
              <div
                className={styles.cartItem}
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
              >
                <div className={styles.cartItemImage}>
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className={styles.cartItemInfo}>
                  <div>
                    <h4 className={styles.cartItemName}>{item.product.name}</h4>
                    <p className={styles.cartItemMeta}>
                      {item.selectedSize} · {item.selectedColor}
                    </p>
                  </div>

                  <div className={styles.cartItemBottom}>
                    <div className={styles.quantity}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <span className={styles.cartItemPrice}>
                      ${(item.product.price * item.quantity).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>

                    <button
                      className={styles.removeBtn}
                      onClick={() =>
                        removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                      }
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>SUBTOTAL</span>
              <span className={styles.summaryValue}>
                ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>SHIPPING</span>
              <span className={styles.summaryValue}>CALCULATED AT CHECKOUT</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.summaryLabel}>TOTAL</span>
              <span className={`${styles.summaryValue} ${styles.totalValue}`}>
                ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Link href="/checkout" onClick={closeCart}>
              <button className={styles.checkoutBtn} id="checkout-button">
                PROCEED TO CHECKOUT
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
