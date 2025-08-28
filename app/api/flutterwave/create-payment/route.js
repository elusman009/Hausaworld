import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { movieId, price, email, title } = body;

    const tx_ref = `hausaworld_${movieId}_${Date.now()}`;

    // create a pending purchase row (manual record; will confirm on verify)
    const { data: purchase } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: null,          // optional: will attach user later after verification
        movie_id: movieId,
        payment_method: "flutterwave",
        payment_status: "pending",
        amount: price
      })
      .select()
      .single();

    // Create Flutterwave payment
    const payload = {
      tx_ref,
      amount: price,
      currency: "NGN",
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/flutterwave/verify?tx_ref=${tx_ref}`,
      customer: {
        email,
        name: email
      },
      meta: {
        purchase_id: purchase.id,
        movieId
      }
    };

    const r = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await r.json();

    if (!result || result.status !== "success") {
      return NextResponse.json({ error: result }, { status: 500 });
    }

    return NextResponse.json({ checkout_url: result.data.link, tx_ref, purchase_id: purchase.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
