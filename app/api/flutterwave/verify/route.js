import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const tx_ref = url.searchParams.get("tx_ref");
    const status = url.searchParams.get("status"); // might be provided

    // You may also receive transaction_id and other params
    // Best practice: call Flutterwave verify endpoint with tx_ref or transaction_id

    // NOTE: depending on Flutterwave response shape, adjust the verify call:
    // Here we try to fetch transaction by tx_ref using /v3/transactions/verify_by_reference?tx_ref=...
    const verifyResp = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
      }
    });
    const verifyData = await verifyResp.json();

    if (!verifyData || verifyData.status !== "success") {
      // redirect to failure page or show message
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/?payment=failed`);
    }

    // If verified, update purchase record
    const meta = verifyData.data.meta || {};
    const purchase_id = meta.purchase_id;

    await supabaseAdmin
      .from("purchases")
      .update({
        payment_status: "approved",
        flutterwave_tx_id: verifyData.data.id,
        user_id: null  // optionally attach user if possible
      })
      .eq("id", purchase_id);

    // TODO: Send email, unlock download (signed URL)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/my-purchases?payment=success`);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/?payment=error`);
  }
}
