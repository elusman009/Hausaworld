import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req) {
  // expects formData with file and purchaseId
  const form = await req.formData();
  const file = form.get("file");
  const purchaseId = form.get("purchaseId");

  if (!file || !purchaseId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

  // Read file bytes
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${purchaseId}_${Date.now()}_${file.name}`;

  // Upload to Supabase storage bucket 'proofs'
  const { data, error } = await supabaseAdmin.storage.from("proofs").upload(filename, buffer, {
    contentType: file.type
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // update purchase record with proof_url and stay 'pending'
  await supabaseAdmin.from("purchases").update({ proof_url: data.path }).eq("id", purchaseId);

  return NextResponse.json({ ok: true, path: data.path });
}
