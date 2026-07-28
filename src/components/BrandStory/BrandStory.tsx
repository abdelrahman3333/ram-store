import React from 'react';
import Image from 'next/image';
import styles from './BrandStory.module.css';
import { SiteSettings } from '@/lib/dummyData';

interface BrandStoryProps {
  settings?: SiteSettings;
}

export default function BrandStory({ settings }: BrandStoryProps) {
  return (
    <section className={styles.section} id="brand">
      {/* Background */}
      <div className={styles.background}>
        <Image
          src={settings?.brand_story_image || "/images/mountain-bg.png"}
          alt="Mountain landscape"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className={styles.backgroundOverlay} />
      </div>

      {/* Graffiti Watermark */}
      <div className={styles.graffiti}>FRZN PUFFERS</div>

      {/* Content */}
      <div className={styles.content}>
        {/* Story Row */}
        <div className={styles.storyRow}>
          <div className={styles.storyText}>
            <p className={styles.storyLabel}>{settings?.brand_story_title || '[ MATERIAL : GLACIER SPEC ]'}</p>
            <p className={styles.storyBody}>
              {settings?.brand_story_text || 'RAM was born in the mountains. Not as a brand, but as a response.'}
            </p>
          </div>

          <div className={styles.storyQuote}>
            <p className={styles.quoteText}>
              {settings?.brand_story_quote || 'FOR THOSE WHO CLIMB, NOT FOR THE CROWD.'}
            </p>
          </div>
        </div>

        {/* Bold Taglines */}
        <div className={styles.taglines}>
          <h2 className={styles.tagline}>BUILT FOR COLD</h2>
          <h2 className={styles.tagline}>MADE FOR HEIGHT</h2>
          <h2 className={styles.tagline}>FORGED TO LAST</h2>
        </div>

        {/* Brand Info */}
        <div className={styles.brandInfo}>
          <span className={styles.brandLogo}>RAM</span>
          <div className={styles.brandMeta}>
            GRADE COLD WEAR<br />
            EST. MMXXIV · ARCTIC DIVISION
          </div>
        </div>
      </div>
    </section>
  );
}
