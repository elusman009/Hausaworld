"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPurchases() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPending() {
    // fetch pending manual purchases (server should enforce admin but UI just displays)
    const { data } = await supabase.from("purchases").select("*, profiles(email, full_name), movies(title)").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchPending(); }, []);

  async function updateStatus(purchaseId, status) {
    const { data } = await supabase.auth.getUser();
    const token = data?.user?.access_token;

    const resp = await fetch("/api/admin/approve-purchase", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId, status })
    });
    const res = await resp.json();
    if (res?.ok) fetchPending();
    else alert(res?.error || "Update failed");
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Purchases</h1>
      <div className="grid gap-3">
        {rows.map(r => (
          <div key={r.id} className="p-4 bg-[#0d0d0d] rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.movies?.title}</div>
              <div className="text-sm text-gray-400">User: {r.profiles?.email ?? r.user_id}</div>
              <div className="text-sm text-gray-400">Method: {r.payment_method} • Status: {r.payment_status}</div>
            </div>
            <div className="flex gap-2">
              {r.payment_status !== "approved" && <button onClick={() => updateStatus(r.id, "approved")} className="px-3 py-1 bg-green-600 rounded">Approve</button>}
              {r.payment_status !== "rejected" && <button onClick={() => updateStatus(r.id, "failed")} className="px-3 py-1 bg-red-600 rounded">Reject</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
