'use client';

import React, { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings, uploadProductImage } from '@/lib/api';
import { SiteSettings } from '@/lib/dummyData';
import styles from '../admin.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Files
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
  const [brandStoryImgFile, setBrandStoryImgFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const data = await getSiteSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      let hero_bg_image = settings.hero_bg_image;
      let brand_story_image = settings.brand_story_image;

      if (heroBgFile) {
        hero_bg_image = await uploadProductImage(heroBgFile);
      }
      if (brandStoryImgFile) {
        brand_story_image = await uploadProductImage(brandStoryImgFile);
      }

      const success = await updateSiteSettings({
        ...settings,
        hero_bg_image,
        brand_story_image
      });
      
      if (!success) throw new Error("Database update failed (check schema cache)");

      alert('Settings saved successfully!');
      // Reset files
      setHeroBgFile(null);
      setBrandStoryImgFile(null);
      fetchSettings(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className={styles.adminPage}><div className={styles.header}><h1 className={styles.title}>LOADING SETTINGS...</h1></div></div>;
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <div className={styles.adminHeader}>
          <div>
            <h1 className={styles.adminTitle}>HOMEPAGE SETTINGS</h1>
            <p className={styles.adminSubtitle}>MANAGE HERO AND BRAND STORY</p>
          </div>
          <button className={styles.addBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE SETTINGS'}
          </button>
        </div>

        <nav className={styles.adminNav}>
          <a href="/admin" className={styles.adminNavLink}>OVERVIEW</a>
          <a href="/admin/products" className={styles.adminNavLink}>PRODUCTS</a>
          <a href="/admin/orders" className={styles.adminNavLink}>ORDERS</a>
          <a href="/admin/settings" className={`${styles.adminNavLink} ${styles.active}`}>SETTINGS</a>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', backgroundColor: 'var(--color-bg-light)', padding: '30px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        
        {/* HERO SECTION */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', marginBottom: '15px', color: 'var(--color-text)' }}>HERO SECTION</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label className={styles.modalLabel}>HERO SUBTITLE (e.g. ARTIC GRADE MIL-SPEC INSULATION)</label>
              <input
                className={styles.modalInput}
                value={settings.hero_subtitle || ''}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
              />
            </div>

            <div>
              <label className={styles.modalLabel}>CUSTOM HERO BACKGROUND IMAGE (Optional, overrides product images)</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  id="hero-bg-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && setHeroBgFile(e.target.files[0])}
                />
                <button
                  type="button"
                  className={styles.modalInput}
                  style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent', border: '1px dashed var(--color-border)', width: 'auto' }}
                  onClick={() => document.getElementById('hero-bg-upload')?.click()}
                >
                  UPLOAD IMAGE
                </button>
                {(heroBgFile || settings.hero_bg_image) && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {heroBgFile ? heroBgFile.name : 'Current: ' + settings.hero_bg_image?.split('/').pop()}
                  </span>
                )}
                {settings.hero_bg_image && !heroBgFile && (
                  <button type="button" onClick={() => setSettings({...settings, hero_bg_image: ''})} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '12px' }}>REMOVE</button>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr style={{ borderTop: '1px solid var(--color-border)', opacity: 0.5 }} />

        {/* BRAND STORY SECTION */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', marginBottom: '15px', color: 'var(--color-text)' }}>BRAND STORY SECTION</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label className={styles.modalLabel}>BRAND STORY TITLE (e.g. [ MATERIAL : GLACIER SPEC ])</label>
              <input
                className={styles.modalInput}
                value={settings.brand_story_title || ''}
                onChange={(e) => setSettings({ ...settings, brand_story_title: e.target.value })}
              />
            </div>

            <div>
              <label className={styles.modalLabel}>BRAND STORY MAIN TEXT</label>
              <textarea
                className={styles.modalInput}
                style={{ height: '100px', resize: 'vertical' }}
                value={settings.brand_story_text || ''}
                onChange={(e) => setSettings({ ...settings, brand_story_text: e.target.value })}
              />
            </div>

            <div>
              <label className={styles.modalLabel}>BRAND STORY QUOTE</label>
              <input
                className={styles.modalInput}
                value={settings.brand_story_quote || ''}
                onChange={(e) => setSettings({ ...settings, brand_story_quote: e.target.value })}
              />
            </div>

            <div>
              <label className={styles.modalLabel}>BRAND STORY BACKGROUND IMAGE</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  id="brand-story-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && setBrandStoryImgFile(e.target.files[0])}
                />
                <button
                  type="button"
                  className={styles.modalInput}
                  style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent', border: '1px dashed var(--color-border)', width: 'auto' }}
                  onClick={() => document.getElementById('brand-story-upload')?.click()}
                >
                  UPLOAD IMAGE
                </button>
                {(brandStoryImgFile || settings.brand_story_image) && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {brandStoryImgFile ? brandStoryImgFile.name : 'Current: ' + settings.brand_story_image?.split('/').pop()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}
