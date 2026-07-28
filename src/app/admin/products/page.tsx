'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/dummyData';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/lib/api';
import styles from '../admin.module.css';

interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  existingImages: string[];
  newFiles: File[];
}

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    collection: '',
    sizes: '',
    materials: '',
    details: '',
    sizeAndFit: '',
    shippingAndReturns: '',
    inventory_status: 'IN STOCK',
    featured: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getProducts();
    setProductList(data);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', price: '', category: '', stock: '', description: '', collection: '',
      sizes: 'S, M, L, XL', 
      materials: '',
      details: '',
      sizeAndFit: '',
      shippingAndReturns: '',
      inventory_status: 'IN STOCK',
      featured: false
    });
    setColorVariants([{ id: Date.now().toString(), name: 'Default', hex: '#a8c8e8', existingImages: [], newFiles: [] }]);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      description: product.description || '',
      collection: product.collection || '',
      sizes: product.sizes?.join(', ') || '',
      materials: product.materials?.join(', ') || '',
      details: product.details?.join(', ') || '',
      sizeAndFit: product.sizeAndFit?.join(', ') || '',
      shippingAndReturns: product.shippingAndReturns?.join(', ') || '',
      inventory_status: product.inventory_status || 'IN STOCK',
      featured: product.featured || false,
    });
    
    const variants = product.colors && product.colors.length > 0 
      ? product.colors.map((c, i) => ({
          id: i.toString(),
          name: c.name,
          hex: c.hex || '#a8c8e8',
          existingImages: c.images || (i === 0 ? product.images : []) || [], // fallback if no specific images
          newFiles: []
        }))
      : [{ id: '0', name: 'Default', hex: '#a8c8e8', existingImages: product.images || [], newFiles: [] }];
      
    setColorVariants(variants);
    setShowModal(true);
  };

  const handleAddColor = () => {
    setColorVariants([...colorVariants, { id: Date.now().toString(), name: 'New Color', hex: '#ffffff', existingImages: [], newFiles: [] }]);
  };

  const handleRemoveColor = (id: string) => {
    setColorVariants(colorVariants.filter(v => v.id !== id));
  };

  const handleColorChange = (id: string, field: 'name' | 'hex', value: string) => {
    setColorVariants(colorVariants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const extractColor = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');
        
        ctx.drawImage(img, 0, 0, 50, 50);
        // sample center area (20x20)
        const imageData = ctx.getImageData(15, 15, 20, 20).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imageData.length; i += 4) {
          // ignore mostly white/transparent background pixels
          if (imageData[i+3] < 128) continue; // transparent
          if (imageData[i] > 240 && imageData[i+1] > 240 && imageData[i+2] > 240) continue; // near white
          
          r += imageData[i];
          g += imageData[i+1];
          b += imageData[i+2];
          count++;
        }
        
        if (count === 0) {
          resolve(''); // fallback if all pixels ignored
        } else {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          const hex = "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
          resolve(hex);
        }
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    });
  };

  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      
      let autoHex = '';
      if (filesArr.length > 0) {
        autoHex = await extractColor(filesArr[0]);
      }
      
      setColorVariants(prev => prev.map(v => {
        if (v.id === id) {
          return { 
            ...v, 
            newFiles: [...v.newFiles, ...filesArr],
            hex: autoHex ? autoHex : v.hex 
          };
        }
        return v;
      }));
    }
    // reset input
    e.target.value = '';
  };

  const removeSelectedFile = (colorId: string, fileIndex: number) => {
    setColorVariants(colorVariants.map(v => v.id === colorId ? { ...v, newFiles: v.newFiles.filter((_, i) => i !== fileIndex) } : v));
  };

  const removeExistingImage = (colorId: string, imgIndex: number) => {
    setColorVariants(colorVariants.map(v => v.id === colorId ? { ...v, existingImages: v.existingImages.filter((_, i) => i !== imgIndex) } : v));
  };

  const parseCommaSeparated = (str: string) => {
    if (!str.trim()) return [];
    return str.split(',').map(s => s.trim()).filter(s => s !== '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedSizes = parseCommaSeparated(formData.sizes);
      const parsedMaterials = parseCommaSeparated(formData.materials);
      const parsedDetails = parseCommaSeparated(formData.details);
      const parsedSizeAndFit = parseCommaSeparated(formData.sizeAndFit);
      const parsedShippingAndReturns = parseCommaSeparated(formData.shippingAndReturns);

      // Upload files for all variants
      const finalColors = await Promise.all(colorVariants.map(async (variant) => {
        const newImageUrls = await Promise.all(
          variant.newFiles.map(file => uploadProductImage(file))
        );
        const variantImages = [...variant.existingImages, ...newImageUrls];
        return {
          name: variant.name,
          hex: variant.hex,
          images: variantImages
        };
      }));

      // Flatten all images for the global `images` array
      const allImages = finalColors.flatMap(c => c.images);

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          price: parseFloat(formData.price) || 0,
          category: formData.category,
          stock: parseInt(formData.stock) || 0,
          inventory_status: formData.inventory_status,
          description: formData.description,
          collection: formData.collection,
          images: allImages,
          sizes: parsedSizes,
          colors: finalColors,
          materials: parsedMaterials,
          details: parsedDetails,
          size_and_fit: parsedSizeAndFit,
          shipping_and_returns: parsedShippingAndReturns,
          featured: formData.featured,
        });
      } else {
        let generatedSlug = formData.name.trim().replace(/\s+/g, '-').toLowerCase();
        // Remove characters that might cause URL issues, but keep Arabic characters
        generatedSlug = generatedSlug.replace(/[^\w\-أ-ي]/g, '');
        if (!generatedSlug || generatedSlug === '-') {
          generatedSlug = 'product-' + Date.now();
        }

        await createProduct({
          name: formData.name,
          slug: generatedSlug,
          collection: formData.collection,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          category: formData.category,
          sizes: parsedSizes.length > 0 ? parsedSizes : ['S', 'M', 'L', 'XL'],
          colors: finalColors,
          images: allImages.length > 0 ? allImages : ['/images/product-white-puffer.png'],
          stock: parseInt(formData.stock) || 0,
          inventory_status: formData.inventory_status,
          featured: formData.featured,
          materials: parsedMaterials,
          details: parsedDetails,
          size_and_fit: parsedSizeAndFit,
          shipping_and_returns: parsedShippingAndReturns,
        });
      }
      setShowModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving product', error);
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting product', error);
        alert('Error deleting product');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>LOADING PRODUCTS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <div className={styles.adminHeader}>
          <div>
            <h1 className={styles.adminTitle}>Product Management</h1>
            <p className={styles.adminSubtitle}>MANAGE INVENTORY & CATALOG</p>
          </div>
        </div>

        <nav className={styles.adminNav}>
          <Link href="/admin" className={styles.adminNavLink}>OVERVIEW</Link>
          <Link href="/admin/products" className={`${styles.adminNavLink} ${styles.active}`}>PRODUCTS</Link>
          <Link href="/admin/orders" className={styles.adminNavLink}>ORDERS</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>SETTINGS</Link>
        </nav>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>ALL PRODUCTS ({productList.length})</h2>
            <button className={styles.addBtn} onClick={openAddModal} id="add-product-btn">
              + ADD PRODUCT
            </button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.tableProductInfo}>
                      <div className={styles.tableProductImage}>
                        <Image
                          src={product.images?.[0] || '/images/hero-model.png'}
                          alt={product.name}
                          fill
                          sizes="44px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <span className={styles.tableProductName}>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${product.inventory_status === 'IN STOCK' ? styles.inStock : product.inventory_status === 'OUT OF STOCK' ? styles.outOfStock : styles.lowStock}`}>
                      {product.inventory_status || 'IN STOCK'}
                    </span>
                  </td>
                  <td>
                    <button className={styles.editBtn} onClick={() => openEditModal(product)}>
                      EDIT
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(product.id)}>
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingProduct ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalForm}>
              <div className={styles.modalFormRow}>
                <div>
                  <label className={styles.modalLabel}>PRODUCT NAME</label>
                  <input
                    className={styles.modalInput}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ARTIC 01™"
                  />
                </div>
                <div>
                  <label className={styles.modalLabel}>COLLECTION</label>
                  <input
                    className={styles.modalInput}
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    placeholder="ARTIC SERIES"
                  />
                </div>
              </div>

              <div className={styles.modalFormRow}>
                <div>
                  <label className={styles.modalLabel}>PRICE ($)</label>
                  <input
                    className={styles.modalInput}
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="899.99"
                  />
                </div>
                <div>
                  <label className={styles.modalLabel}>STOCK</label>
                  <input
                    className={styles.modalInput}
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="45"
                  />
                </div>
              </div>

              <div className={styles.modalFormRow}>
                <div>
                  <label className={styles.modalLabel}>CATEGORY</label>
                  <input
                    className={styles.modalInput}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Puffer Jackets"
                  />
                </div>
                <div>
                  <label className={styles.modalLabel}>STATUS</label>
                  <select
                    className={styles.modalInput}
                    value={formData.inventory_status}
                    onChange={(e) => setFormData({ ...formData, inventory_status: e.target.value })}
                    style={{ cursor: 'pointer', appearance: 'auto' }}
                  >
                    <option value="IN STOCK">IN STOCK</option>
                    <option value="LOW STOCK">LOW STOCK</option>
                    <option value="OUT OF STOCK">OUT OF STOCK</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFormRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="featured-toggle"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="featured-toggle" className={styles.modalLabel} style={{ marginBottom: 0, cursor: 'pointer' }}>
                    FEATURE ON HOMEPAGE
                  </label>
                </div>
              </div>

              <div className={styles.modalFormRow}>
                <div>
                  <label className={styles.modalLabel}>SIZES (COMMA SEPARATED)</label>
                  <input
                    className={styles.modalInput}
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className={styles.modalLabel}>MATERIALS (COMMA SEPARATED)</label>
                  <input
                    className={styles.modalInput}
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    placeholder="Nylon, Goose down"
                  />
                </div>
              </div>

              <div className={styles.modalFormRow}>
                <div>
                  <label className={styles.modalLabel}>DETAILS (COMMA SEPARATED)</label>
                  <input
                    className={styles.modalInput}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Waterproof, Windproof"
                  />
                </div>
              </div>

              <div className={styles.modalFormRow}>
                <div>
                  <label className={styles.modalLabel}>SIZE & FIT (COMMA SEPARATED)</label>
                  <input
                    className={styles.modalInput}
                    value={formData.sizeAndFit}
                    onChange={(e) => setFormData({ ...formData, sizeAndFit: e.target.value })}
                    placeholder="Regular fit, Model is 6'1 wearing L"
                  />
                </div>
                <div>
                  <label className={styles.modalLabel}>SHIPPING & RETURNS (COMMA SEPARATED)</label>
                  <input
                    className={styles.modalInput}
                    value={formData.shippingAndReturns}
                    onChange={(e) => setFormData({ ...formData, shippingAndReturns: e.target.value })}
                    placeholder="Free shipping over $50, 30-day return policy"
                  />
                </div>
              </div>

              {/* Color Variants Section */}
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <label className={styles.modalLabel} style={{ marginBottom: 0 }}>COLOR VARIANTS & IMAGES</label>
                  <button type="button" onClick={handleAddColor} style={{ background: 'var(--color-accent)', color: 'var(--color-bg)', padding: '4px 12px', fontSize: '10px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    + ADD COLOR
                  </button>
                </div>

                {colorVariants.map((variant, index) => (
                  <div key={variant.id} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: index < colorVariants.length - 1 ? '1px dashed var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          className={styles.modalInput}
                          value={variant.name}
                          onChange={(e) => handleColorChange(variant.id, 'name', e.target.value)}
                          placeholder="Color Name (e.g. White)"
                          style={{ marginBottom: '8px' }}
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={variant.hex}
                            onChange={(e) => handleColorChange(variant.id, 'hex', e.target.value)}
                            style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                          />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-muted)' }}>HEX: {variant.hex}</span>
                        </div>
                      </div>

                      <div style={{ flex: 2 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(variant.id, e)}
                            style={{ display: 'none' }}
                            id={`file-upload-${variant.id}`}
                          />
                          <button 
                            type="button"
                            className={styles.modalInput} 
                            style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'var(--color-bg-light)', border: '1px dashed var(--color-border)' }} 
                            onClick={() => document.getElementById(`file-upload-${variant.id}`)?.click()}
                          >
                            + UPLOAD IMAGES FOR {variant.name.toUpperCase()}
                          </button>

                          {(variant.existingImages.length > 0 || variant.newFiles.length > 0) && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                              {variant.existingImages.map((url, i) => (
                                <div key={`exist-${i}`} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                  <Image src={url} alt="product image" fill style={{ objectFit: 'cover' }} />
                                  <button 
                                    type="button"
                                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeExistingImage(variant.id, i); }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              {variant.newFiles.map((file, i) => (
                                <div key={`file-${i}`} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', padding: '4px', background: 'var(--color-bg-light)' }}>
                                  <img src={URL.createObjectURL(file)} alt="Preview" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                  <button 
                                    type="button"
                                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', zIndex: 10, width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeSelectedFile(variant.id, i); }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {colorVariants.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveColor(variant.id)}
                          style={{ background: 'transparent', color: 'var(--color-danger)', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px' }}>
                <label className={styles.modalLabel}>DESCRIPTION</label>
                <textarea
                  className={styles.modalTextarea}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                />
              </div>

              <button className={styles.modalSaveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'SAVING...' : (editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
