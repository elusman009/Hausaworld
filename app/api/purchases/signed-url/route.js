import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req) {
  const { purchaseId, userId } = await req.json();

  // Validate purchase belongs to user and is approved
  const { data: p, error } = await supabaseAdmin
    .from("purchases")
    .select("*, movies(file_path)")
    .eq("id", purchaseId)
    .single();

  if (error || !p) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

  // In real app: verify userId matches purchase.user_id (and that user is authenticated)
  if (p.payment_status !== "approved") return NextResponse.json({ error: "Purchase not approved" }, { status: 403 });

  const filePath = p.movies?.file_path;
  if (!filePath) return NextResponse.json({ error: "File path missing" }, { status: 500 });

  // create signed url for 1 hour
  const { data } = await supabaseAdmin.storage.from("movies").createSignedUrl(filePath, 60 * 60);

  if (data?.signedURL) return NextResponse.json({ url: data.signedURL });

  return NextResponse.json({ error: "Failed to make signed URL" }, { status: 500 });
}
