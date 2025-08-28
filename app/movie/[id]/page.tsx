"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import ReviewCard from "@/components/ReviewCard";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      let { data: movieData } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      let { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("movie_id", id);

      setMovie(movieData);
      setReviews(reviewData || []);
      setLoading(false);
    };
    if (id) fetchMovie();
  }, [id]);

  if (loading) return <p className="text-center text-gray-400 mt-10">Loading...</p>;
  if (!movie) return <p className="text-center text-red-500 mt-10">Movie not found.</p>;

  return (
    <main className="bg-black min-h-screen text-white">
      <Navbar onSearch={() => {}} />

      <div className="max-w-5xl mx-auto p-4">
        {/* Poster & Trailer */}
        <div className="grid md:grid-cols-2 gap-6">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="rounded-2xl shadow-lg"
          />

          <div>
            <h1 className="text-3xl font-bold">{movie.title}</h1>
            <p className="text-gray-400">{movie.genre} • {movie.year}</p>
            <p className="mt-2 text-yellow-400">⭐ {movie.rating}</p>
            <p className="mt-3 text-lg font-semibold text-red-500">${movie.price}</p>

            <p className="mt-4 text-gray-300">{movie.description}</p>

            <button
              className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-semibold"
              onClick={() => alert("Buy with Flutterwave (coming soon)")}
            >
              Buy / Rent
            </button>
          </div>
        </div>

        {/* Trailer */}
        {movie.trailer_url && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3">Trailer</h2>
            <div className="aspect-video">
              <iframe
                src={movie.trailer_url}
                title="Trailer"
                className="w-full h-full rounded-xl"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="grid gap-3">
              {reviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
