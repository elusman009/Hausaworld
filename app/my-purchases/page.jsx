"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(data.user);
      // fetch purchases for this user (including movie)
      const { data: rows, error } = await supabase
        .from("purchases")
        .select("id, movie_id, payment_status, amount, created_at, movies(*)")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setPurchases([]);
      } else {
        setPurchases(rows || []);
      }
      setLoading(false);
    })();
  }, []);

  async function getDownload(purchaseId) {
    if (!user) return alert("Sign in required");
    // call server endpoint to create signed url
    const resp = await fetch("/api/purchases/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchaseId, userId: user.id })
    });
    const data = await resp.json();
    if (data?.url) {
      window.open(data.url, "_blank");
    } else {
      alert(data?.error || "Failed to generate download link");
    }
  }

  if (loading) return <>
    <Navbar />
    <div className="py-10">Loading...</div>
  </>;

  return (
    <>
      <Navbar />
      <div className="py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Purchases</h1>
        {purchases.length === 0 ? (
          <div className="text-gray-400">You haven't purchased any movies yet.</div>
        ) : (
          <div className="grid gap-4">
            {purchases.map(p => (
              <div key={p.id} className="p-4 bg-[#0d0d0d] rounded flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.movies?.poster_url} alt={p.movies?.title} className="w-20 h-28 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{p.movies?.title}</div>
                    <div className="text-sm text-gray-400">Purchased: {new Date(p.created_at).toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Status: <span className={p.payment_status === 'approved' ? 'text-green-400' : 'text-yellow-400'}>{p.payment_status}</span></div>
                  </div>
                </div>

                <div>
                  {p.payment_status === "approved" ? (
                    <button onClick={() => getDownload(p.id)} className="px-4 py-2 bg-hausaworldRed rounded">Download</button>
                  ) : (
                    <div className="text-sm text-gray-400">Awaiting approval</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
