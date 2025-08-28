"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  async function fetchReviews() {
    const { data } = await supabase.from("reviews").select("*, movies(title), profiles(full_name, email)").order("created_at", { ascending: false });
    setReviews(data || []);
  }

  useEffect(() => { fetchReviews(); }, []);

  async function deleteReview(id) {
    const { data } = await supabase.auth.getUser();
    const token = data?.user?.access_token;

    const resp = await fetch("/api/admin/delete-review", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const res = await resp.json();
    if (res?.ok) fetchReviews(); else alert(res?.error || "Failed");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Moderate Reviews</h1>
      <div className="grid gap-3">
        {reviews.map(rv => (
          <div key={rv.id} className="p-3 bg-[#0d0d0d] rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{rv.profiles?.full_name ?? "Anonymous"}</div>
                <div className="text-sm text-gray-400">{rv.rating} • {rv.movies?.title}</div>
              </div>
              <div>
                <button onClick={() => deleteReview(rv.id)} className="px-3 py-1 bg-red-700 rounded">Delete</button>
              </div>
            </div>
            <p className="mt-2 text-gray-300">{rv.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
