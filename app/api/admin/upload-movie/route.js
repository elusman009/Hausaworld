import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { getUserFromAuthHeader } from "@/lib/serverAuth";

/**
 * Receives formData:
 * - title, genre, year, price, trailer_url
 * - poster (file)
 * - movie (file)
 *
 * Requires Authorization: Bearer <access_token> header for admin check.
 */
export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    const { user, profile } = await getUserFromAuthHeader(auth);
    if (!user || !profile || profile.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const title = form.get("title");
    const genre = form.get("genre");
    const year = form.get("year");
    const price = form.get("price");
    const trailer_url = form.get("trailer_url");
    const poster = form.get("poster");
    const movie = form.get("movie");

    // Upload poster if present
    let poster_url = null;
    if (poster && poster.size > 0) {
      const posterBuffer = Buffer.from(await poster.arrayBuffer());
      const posterName = `posters/${Date.now()}_${poster.name}`;
      const { data: posterData, error: pErr } = await supabaseAdmin.storage.from("posters").upload(posterName, posterBuffer, { contentType: poster.type });
      if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
      // make public url
      const { data: publicData } = await supabaseAdmin.storage.from("posters").getPublicUrl(posterName);
      poster_url = publicData?.publicUrl || null;
    }

    // Upload movie file to 'movies' bucket
    let file_path = null;
    if (movie && movie.size > 0) {
      const movieBuffer = Buffer.from(await movie.arrayBuffer());
      const movieName = `movies/${Date.now()}_${movie.name}`;
      const { data: movieData, error: mErr } = await supabaseAdmin.storage.from("movies").upload(movieName, movieBuffer, { contentType: movie.type });
      if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
      file_path = movieData.path;
    }

    // Insert movie record
    const { data: inserted, error: iErr } = await supabaseAdmin
      .from("movies")
      .insert({
        title,
        description: "",
        genre,
        year: parseInt(year || "0"),
        price: parseFloat(price || "0"),
        poster_url,
        file_path,
        trailer_url
      })
      .select()
      .single();

    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

    // Notify users who opted in (OPTIONAL): You can call a server function to send emails here.
    // TODO: send notifications via SendGrid

    return NextResponse.json({ ok: true, movie: inserted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
