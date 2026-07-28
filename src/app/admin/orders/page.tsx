'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecentOrders, updateOrderStatus as updateOrderStatusApi } from '@/lib/api';
import styles from '../admin.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getRecentOrders();
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const updateStatus = async (orderId: string, newStatus: 'pending' | 'shipped' | 'delivered') => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>LOADING ORDERS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <div className={styles.adminHeader}>
          <div>
            <h1 className={styles.adminTitle}>Order Management</h1>
            <p className={styles.adminSubtitle}>TRACK & UPDATE ORDERS</p>
          </div>
        </div>

        <nav className={styles.adminNav}>
          <Link href="/admin" className={styles.adminNavLink}>OVERVIEW</Link>
          <Link href="/admin/products" className={styles.adminNavLink}>PRODUCTS</Link>
          <Link href="/admin/orders" className={`${styles.adminNavLink} ${styles.active}`}>ORDERS</Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>SETTINGS</Link>
        </nav>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>PENDING</p>
            <p className={styles.statValue}>{orders.filter((o) => o.status === 'pending').length}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>SHIPPED</p>
            <p className={styles.statValue}>{orders.filter((o) => o.status === 'shipped').length}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>DELIVERED</p>
            <p className={styles.statValue}>{orders.filter((o) => o.status === 'delivered').length}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>TOTAL REVENUE</p>
            <p className={styles.statValue}>
              ${orders.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
          {['all', 'pending', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${filterStatus === status ? 'var(--color-accent)' : 'var(--glass-border)'}`,
                background: filterStatus === status ? 'rgba(107, 184, 240, 0.15)' : 'transparent',
                color: filterStatus === status ? 'var(--color-accent-bright)' : 'var(--color-ghost-white)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-xs)',
                letterSpacing: 'var(--ls-wide)',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>ORDERS ({filteredOrders.length})</h2>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>EMAIL</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{order.id.split('-')[0]}...</td>
                    <td>{order.profiles?.full_name || 'Guest User'}</td>
                    <td>{order.profiles?.email || 'N/A'}</td>
                    <td>${Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {order.status === 'pending' && (
                        <button
                          className={styles.editBtn}
                          onClick={() => updateStatus(order.id, 'shipped')}
                        >
                          SHIP
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          className={styles.editBtn}
                          onClick={() => updateStatus(order.id, 'delivered')}
                        >
                          DELIVER
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-success)', letterSpacing: 'var(--ls-wide)' }}>
                          COMPLETED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
