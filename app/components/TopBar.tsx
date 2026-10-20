"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";
import { signInWithGoogle } from "@/lib/auth";
import { syncCacheOwner } from "@/lib/homeCache";
import styles from "./TopBar.module.css";

// Placeholder text per page, matching the design.
const PLACEHOLDERS: Record<string, string> = {
  "/": "Type in your cravings",
  "/saved-meals": "Search your saved meals",
  "/boards": "Search your boards",
};

export default function TopBar() {
  // The signed-in user (null = signed out). Comes from Supabase Auth, which keeps the session in cookies.
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [text, setText] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Load the current user once, then stay in sync when they sign in or out.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      // New person since the Home cache was made? Clear the old "Saved" marks and reload once.
      if (syncCacheOwner(data.user?.id ?? null)) window.location.reload();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Sends you to Google, then back to /auth/callback, which finishes the login and returns you to this page.
  function signIn() {
    return signInWithGoogle(supabase);
  }

  async function signOut() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    // Home's cached cards may say "Saved" for the user who just left: clear that, then reload.
    if (syncCacheOwner(null)) window.location.reload();
    else router.refresh(); // re-fetch the server pages so they stop showing this user's data
  }

  // First letter of the user's Google name (or email) for the avatar circle.
  const initial = (user?.user_metadata?.full_name ?? user?.email ?? "?")
    .charAt(0)
    .toUpperCase();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When you move to another page, show that page's search (empty if none),
  // so "salmon" typed on Saved Meals doesn't follow you to Boards.
  useEffect(() => {
    setText(searchParams.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Saved Meals and Boards search as you type (after a short pause).
  // The search goes into the URL (?q=), keeping any sort that's already there.
  function liveSearch(value: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 250);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = text.trim();
    // Home generates meals on Enter. The other pages already search as you type.
    if (pathname !== "/" || !q) return;
    // `t` makes the URL unique so searching the same words again regenerates.
    router.push(`/?q=${encodeURIComponent(q)}&t=${Date.now()}`);
  }

  return (
    <header className={styles.topbar}>
      <form className={styles.search} onSubmit={handleSearch}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (pathname === "/saved-meals" || pathname === "/boards") {
              liveSearch(e.target.value);
            }
          }}
          placeholder={PLACEHOLDERS[pathname] ?? "Search"}
          className={styles.searchInput}
        />
      </form>

      <div className={styles.authArea}>
        {user ? (
          <div className={styles.profileWrap}>
            <button
              className={styles.profileButton}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
            >
              <span className={styles.avatar}>{initial}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <button className={styles.dropdownItem} onClick={signOut}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.signInButton} onClick={signIn}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}