import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <h3 className={styles.footerLogo}>RAM</h3>
            <p className={styles.footerDesc}>
              Grade cold wear engineered for the extreme. Every piece is calibrated
              for sub-zero performance, built in the mountains, tested by the storm.
            </p>

            <div className={styles.newsletter}>
              <input type="email" placeholder="YOUR EMAIL" id="newsletter-email" />
              <button id="newsletter-subscribe">JOIN</button>
            </div>
          </div>

          {/* Navigation */}
          <div className={styles.footerColumn}>
            <h4>NAVIGATE</h4>
            <Link href="/#collection">CATALOG</Link>
            <Link href="/#products">NEW DROPS</Link>
            <Link href="/#brand">OUR STORY</Link>
            <Link href="/admin">ADMIN</Link>
          </div>

          {/* Support */}
          <div className={styles.footerColumn}>
            <h4>SUPPORT</h4>
            <Link href="#">SIZING GUIDE</Link>
            <Link href="#">SHIPPING</Link>
            <Link href="#">RETURNS</Link>
            <Link href="#">CONTACT</Link>
          </div>

          {/* Legal */}
          <div className={styles.footerColumn}>
            <h4>LEGAL</h4>
            <Link href="#">PRIVACY</Link>
            <Link href="#">TERMS</Link>
            <Link href="#">COOKIES</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <span className={styles.copyright}>
            © 2024 RAM ARCTIC DIVISION — ALL RIGHTS RESERVED
          </span>

          <div className={styles.socialLinks}>
            {/* Instagram */}
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* TikTok */}
            <a href="#" className={styles.socialLink} aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
