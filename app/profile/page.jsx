"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      if (data?.user) {
        // fetch profile row
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        if (prof) setProfile(prof);
        else {
          // upsert minimal profile
          await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name ?? data.user.email,
            });
          const { data: newProf } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          setProfile(newProf);
        }
      }
    })();
  }, []);

  async function toggleNotifications() {
    if (!user) return alert("Sign in first");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ notification_enabled: !profile.notification_enabled })
      .eq("id", user.id);
    if (error) alert(error.message);
    else setProfile(prev => ({ ...prev, notification_enabled: !prev.notification_enabled }));
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      <Navbar />
      <div className="py-8 max-w-3xl mx-auto">
        <div className="bg-[#0e0e0e] p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          {!user ? (
            <div>Please sign in.</div>
          ) : (
            <>
              <div className="mb-3">
                <div className="text-sm text-gray-400">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div className="mb-3">
                <div className="text-sm text-gray-400">Full name</div>
                <div className="font-medium">{profile?.full_name ?? "—"}</div>
              </div>

              <div className="mb-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!profile?.notification_enabled}
                    onChange={toggleNotifications}
                    className="w-5 h-5"
                  />
                  <span>Receive emails when new movies are uploaded</span>
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={signOut} className="px-4 py-2 bg-hausaworldRed rounded">Sign out</button>
                <button disabled className="px-4 py-2 bg-gray-700 rounded">Delete account (TODO)</button>
              </div>
              {saving && <div className="text-sm text-gray-400 mt-2">Saving...</div>}
            </>
          )}
        </div>
      </div>
    </>
  );
}
