// lib/serverAuth.js
import supabaseAdmin from "./supabaseAdmin";

/**
 * Verifies a Supabase access token (from Authorization header)
 * and returns user object and profile.
 * - pass token: "Bearer ey..."
 */
export async function getUserFromAuthHeader(authorizationHeader) {
  if (!authorizationHeader) return { user: null, profile: null };

  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { user: null, profile: null };

  // supabaseAdmin.auth.getUser(token) verifies the token and returns the user
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { user: null, profile: null };

  const user = data.user;

  // fetch profile from profiles table
  const { data: profile, error: pErr } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: pErr ? null : profile };
}
