'use client';

/**
 * SessionGuard — auto-logout when the browser/tab is closed for more than 5 seconds.
 *
 * Strategy:
 *  • Each tab registers a unique ID in localStorage["pdrconnect-tabs"].
 *  • beforeunload fires on real tab/window close AND hard-refresh:
 *      removes this tab's ID; if the list is now empty → records close-timestamp.
 *  • On mount: if a close-timestamp exists and is > GRACE_MS old → the browser
 *      was truly closed → sign out the active Supabase session → redirect /login.
 *  • GRACE_MS (5 s):
 *      < 5 s = hard-refresh or very quick reopen → stay logged in
 *      > 5 s = browser was closed → auto logout
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const TABS_KEY  = 'pdrconnect-tabs';
const CLOSE_KEY = 'pdrconnect-close-ts';
const GRACE_MS  = 5000; // auto-logout if page was closed for more than 5 seconds

export default function SessionGuard() {
  const router = useRouter();
  const tabId  = useRef('');

  useEffect(() => {
    tabId.current = Math.random().toString(36).slice(2, 10);
    const id = tabId.current;

    /* ── 1. Register this tab ── */
    const registerTab = () => {
      try {
        const tabs: string[] = JSON.parse(localStorage.getItem(TABS_KEY) ?? '[]');
        if (!tabs.includes(id)) {
          tabs.push(id);
          localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
        }
      } catch { /* storage might be unavailable */ }
    };

    /* ── 2. Check auto-logout on open ── */
    const checkAutoLogout = async () => {
      try {
        const raw = localStorage.getItem(CLOSE_KEY);
        if (!raw) return;

        const elapsed = Date.now() - parseInt(raw, 10);
        localStorage.removeItem(CLOSE_KEY); // consume flag regardless

        if (elapsed < GRACE_MS) return; // hard-refresh, skip

        // Browser was genuinely closed — revoke session if still active
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.signOut();
          router.replace('/login');
        }
      } catch { /* ignore */ }
    };

    /* ── 3. Record close-time when last tab unloads ── */
    const onBeforeUnload = () => {
      try {
        const tabs: string[] = JSON.parse(localStorage.getItem(TABS_KEY) ?? '[]');
        const remaining = tabs.filter(t => t !== id);
        localStorage.setItem(TABS_KEY, JSON.stringify(remaining));

        if (remaining.length === 0) {
          localStorage.setItem(CLOSE_KEY, Date.now().toString());
        }
      } catch { /* ignore */ }
    };

    registerTab();
    checkAutoLogout();

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      // Component unmount (e.g. hot-reload in dev): just deregister, don't set close-ts
      try {
        const tabs: string[] = JSON.parse(localStorage.getItem(TABS_KEY) ?? '[]');
        localStorage.setItem(TABS_KEY, JSON.stringify(tabs.filter(t => t !== id)));
      } catch { /* ignore */ }
    };
  }, []);

  return null;
}
