"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) { setProfile(null); setLoading(false); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="py-10">Checking admin status...</div>;
  if (!profile || profile.role !== "admin") return <div className="py-10 text-center">Access denied. Admins only.</div>;

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="flex gap-6">
        <aside className="w-60 bg-[#0d0d0d] p-4 rounded-2xl">
          <div className="font-bold mb-4">Admin</div>
          <nav className="flex flex-col gap-2">
            <Link href="/admin/movies" className="px-3 py-2 rounded hover:bg-gray-800">Movies</Link>
            <Link href="/admin/purchases" className="px-3 py-2 rounded hover:bg-gray-800">Purchases</Link>
            <Link href="/admin/reviews" className="px-3 py-2 rounded hover:bg-gray-800">Reviews</Link>
            <Link href="/" className="px-3 py-2 rounded hover:bg-gray-800">Back to site</Link>
          </nav>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
