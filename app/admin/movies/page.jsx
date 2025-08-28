"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminMoviesPage() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("0.00");
  const [posterFile, setPosterFile] = useState(null);
  const [movieFile, setMovieFile] = useState(null);
  const [trailer, setTrailer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // send form data to server admin upload endpoint which uses SUPABASE_SERVICE_ROLE_KEY
    const form = new FormData();
    form.append("title", title);
    form.append("genre", genre);
    form.append("year", year);
    form.append("price", price);
    form.append("trailer_url", trailer);
    if (posterFile) form.append("poster", posterFile);
    if (movieFile) form.append("movie", movieFile);

    // include user's access token for admin check
    const { data } = await supabase.auth.getUser();
    const token = data?.user?.access_token;

    const resp = await fetch("/api/admin/upload-movie", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    const res = await resp.json();
    if (res?.ok) {
      setMessage("Movie uploaded successfully");
      setTitle(""); setGenre(""); setYear(""); setPrice("0.00"); setTrailer("");
    } else {
      setMessage(res?.error || "Upload failed");
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upload Movie</h1>
      <form onSubmit={handleSubmit} className="bg-[#0d0d0d] p-6 rounded-2xl">
        <div className="grid gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="p-2 rounded bg-[#111]" />
          <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Genre" className="p-2 rounded bg-[#111]" />
          <input value={year} onChange={e => setYear(e.target.value)} placeholder="Year" className="p-2 rounded bg-[#111]" />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" className="p-2 rounded bg-[#111]" />
          <input value={trailer} onChange={e => setTrailer(e.target.value)} placeholder="Trailer (embed URL)" className="p-2 rounded bg-[#111]" />
          <label className="text-sm text-gray-400">Poster file</label>
          <input type="file" accept="image/*" onChange={e => setPosterFile(e.target.files?.[0] ?? null)} />
          <label className="text-sm text-gray-400">Movie file</label>
          <input type="file" accept="video/*" onChange={e => setMovieFile(e.target.files?.[0] ?? null)} />
          <div className="flex gap-3">
            <button disabled={loading} className="px-4 py-2 bg-hausaworldRed rounded">{loading ? "Uploading..." : "Upload"}</button>
            <div className="text-sm text-gray-400 self-center">{message}</div>
          </div>
        </div>
      </form>
    </div>
  );
}
