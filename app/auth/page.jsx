"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    // redirect_to will send user back to site (optional)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/`
      }
    });
    if (error) alert(error.message);
    setLoading(false);
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <div className="bg-[#0e0e0e] p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Sign in to Hausaworld</h1>
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 rounded-md bg-white text-black font-semibold"
          >
            {loading ? "Opening..." : "Continue with Google"}
          </button>
        </div>
      </div>
    </>
  );
}
