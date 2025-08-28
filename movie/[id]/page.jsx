import Navbar from "@/components/Navbar";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import dynamic from "next/dynamic";
import MovieCard from "@/components/MovieCard";
const BuyButton = dynamic(() => import("@/components/BuyButton"), { ssr: false });

export default async function MoviePage({ params }) {
  const movieId = params.id;
  const { data: movieArr } = await supabaseAdmin
    .from("movies")
    .select("*")
    .eq("id", movieId)
    .limit(1);

  const movie = movieArr?.[0];
  if (!movie) return <div>Movie not found</div>;

  // fetch reviews + average
  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("*, profiles(id, full_name)")
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false });

  const avg =
    reviews && reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <>
      <Navbar />
      <main className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <img src={movie.poster_url} alt={movie.title} className="w-full rounded-2xl" />
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold">{movie.title} ({movie.year})</h1>
            <div className="my-2 text-gray-300">{movie.genre} • {avg ? `${avg} ★` : "Be the first to review"}</div>
            <p className="my-4 text-gray-300">{movie.description}</p>

            <div className="flex gap-3 items-center">
              <BuyButton movieId={movie.id} price={movie.price} title={movie.title} />
            </div>

            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Trailer</h2>
              {movie.trailer_url ? (
                <div className="aspect-video">
                  <iframe src={movie.trailer_url} title="Trailer" className="w-full h-full rounded" />
                </div>
              ) : (
                <div className="p-4 bg-[#0c0c0c] rounded">No trailer available</div>
              )}
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Reviews</h2>
              {reviews && reviews.length ? (
                reviews.map(rv => (
                  <div key={rv.id} className="p-3 bg-[#0d0d0d] rounded mb-3">
                    <div className="font-semibold">{rv.profiles?.full_name ?? "Anonymous"}</div>
                    <div className="text-sm text-gray-400">{rv.rating} ★ • {new Date(rv.created_at).toLocaleString()}</div>
                    <p className="mt-2 text-gray-300">{rv.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No reviews yet.</div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
