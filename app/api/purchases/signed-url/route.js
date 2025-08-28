import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { purchaseId, userId } = await req.json();
    if (!purchaseId || !userId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const { data: p, error } = await supabaseAdmin
      .from("purchases")
      .select("*, movies(file_path)")
      .eq("id", purchaseId)
      .single();

    if (error || !p) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    if (p.user_id !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (p.payment_status !== "approved") return NextResponse.json({ error: "Not approved" }, { status: 403 });

    const filePath = p.movies?.file_path;
    if (!filePath) return NextResponse.json({ error: "File not available" }, { status: 500 });

    const { data } = await supabaseAdmin.storage.from("movies").createSignedUrl(filePath, 60 * 60);
    if (!data?.signedURL) return NextResponse.json({ error: "Could not create signed URL" }, { status: 500 });

    return NextResponse.json({ url: data.signedURL });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
