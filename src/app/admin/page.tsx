'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats, getRecentOrders } from '@/lib/api';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const [dashboardStats, orders] = await Promise.all([
        getDashboardStats(),
        getRecentOrders()
      ]);
      setStats(dashboardStats);
      setRecentOrders(orders);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>LOADING COMMAND CENTER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        <div className={styles.adminHeader}>
          <div>
            <h1 className={styles.adminTitle}>Admin Dashboard</h1>
            <p className={styles.adminSubtitle}>RAM ARCTIC DIVISION — COMMAND CENTER</p>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className={styles.adminNav}>
          <Link href="/admin" className={`${styles.adminNavLink} ${styles.active}`}>
            OVERVIEW
          </Link>
          <Link href="/admin/products" className={styles.adminNavLink}>
            PRODUCTS
          </Link>
          <Link href="/admin/orders" className={styles.adminNavLink}>
            ORDERS
          </Link>
          <Link href="/admin/settings" className={styles.adminNavLink}>
            SETTINGS
          </Link>
        </nav>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>TOTAL REVENUE</p>
            <p className={styles.statValue}>${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
            <p className={styles.statChange}>Active Total</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>ORDERS</p>
            <p className={styles.statValue}>{stats.totalOrders}</p>
            <p className={styles.statChange}>Total Placed</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>PRODUCTS</p>
            <p className={styles.statValue}>{stats.totalProducts}</p>
            <p className={styles.statChange}>{stats.totalProducts} active items</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>CUSTOMERS</p>
            <p className={styles.statValue}>{stats.totalCustomers}</p>
            <p className={styles.statChange}>Registered Accounts</p>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>RECENT ORDERS</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No orders yet.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{order.id.split('-')[0]}...</td>
                    <td>{order.profiles?.full_name || 'Guest User'}</td>
                    <td>${Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                      {new Date(order.created_at).toLocaleDateString()}
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
