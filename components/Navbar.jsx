"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe && sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <nav className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold text-hausaworldRed">Hausaworld</Link>
      </div>

      <div className="flex items-center gap-4">
        <input
          className="hidden sm:block bg-[#222] px-3 py-2 rounded-lg outline-none placeholder:text-gray-400"
          placeholder="Search movies..."
        />
        {!user ? (
          <Link href="/auth" className="px-4 py-2 rounded-lg bg-hausaworldRed text-white">Sign in</Link>
        ) : (
          <>
            <Link href="/my-purchases" className="px-3 py-2 rounded-lg bg-[#222]">My Purchases</Link>
            <Link href="/profile" className="px-3 py-2 rounded-lg bg-[#222]">Profile</Link>
            <button onClick={signOut} className="px-3 py-2 rounded-lg bg-[#222]">Sign out</button>
          </>
        )}
      </div>
    </nav>
  );
}
