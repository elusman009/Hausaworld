"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function BuyButton({ movieId, price, title }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    const user = await supabase.auth.getUser();
    if (!user?.data?.user) {
      alert("Please sign in first");
      setLoading(false);
      return;
    }
    const email = user.data.user.email;

    // call server to create flutterwave payment
    const resp = await fetch("/api/flutterwave/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId, price, email, title })
    });
    const data = await resp.json();
    if (data && data.checkout_url) {
      // redirect user to Flutterwave checkout
      window.location.href = data.checkout_url;
    } else {
      alert("Failed to create payment");
    }
    setLoading(false);
  }

  return (
    <button onClick={handleBuy} className="bg-hausaworldRed px-5 py-3 rounded font-semibold">
      {loading ? "Processing..." : `Buy • ₦${Number(price).toFixed(2)}`}
    </button>
  );
}
