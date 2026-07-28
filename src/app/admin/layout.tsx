'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
      } else if (!isAdmin(session.user.email)) {
        // Show an error screen instead of redirecting so we can see the email
        setLoading(false);
        // We will handle this in the render
      } else {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email || null);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a192f', color: '#fff' }}>
        <p>VERIFYING CREDENTIALS...</p>
      </div>
    );
  }

  if (userEmail && !isAdmin(userEmail)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a192f', color: '#fff' }}>
        <h2>ACCESS DENIED</h2>
        <p style={{ marginTop: '20px' }}>Your current email is: <strong>{userEmail}</strong></p>
        <p>This email does not have admin privileges.</p>
        <button 
          onClick={() => router.push('/')}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#5bc0be', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Return Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
