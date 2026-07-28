'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('ACCOUNT CREATED. CHECK YOUR EMAIL TO CONFIRM.');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authWatermark}>RAM</div>

      <div className={styles.authCard}>
        <h1 className={styles.authLogo}>RAM</h1>
        <p className={styles.authSubtitle}>CREATE ACCOUNT</p>

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        <form onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="register-name">FULL NAME</label>
            <input
              id="register-name"
              type="text"
              className={styles.formInput}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="JOHN DOE"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="register-email">EMAIL</label>
            <input
              id="register-email"
              type="email"
              className={styles.formInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="register-password">PASSWORD</label>
            <input
              id="register-password"
              type="password"
              className={styles.formInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading} id="register-submit">
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className={styles.authFooter}>
          ALREADY HAVE AN ACCOUNT? <Link href="/auth/login">SIGN IN</Link>
        </p>
      </div>
    </div>
  );
}
