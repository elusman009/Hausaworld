import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { getUserFromAuthHeader } from "@/lib/serverAuth";

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    const { user, profile } = await getUserFromAuthHeader(auth);
    if (!user || !profile || profile.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { purchaseId, status } = body;
    if (!purchaseId || !["approved","failed"].includes(status)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const updates = { payment_status: status };
    // If approved, you might want to add timestamp
    const { error } = await supabaseAdmin.from("purchases").update(updates).eq("id", purchaseId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If approved, send an email and/or create other side effects
    if (status === "approved") {
      // fetch purchase with user email & movie file_path
      const { data: p } = await supabaseAdmin.from("purchases").select("*, movies(*) , profiles(*)").eq("id", purchaseId).single();
      // TODO: create signed url and send via email using SendGrid
      // Example: sendDownloadEmail(p.profiles.email, signedUrl)
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
