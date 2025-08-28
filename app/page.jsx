import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function Home() {
  // server-side fetch movies (latest first)
  const { data: movies = [] } = await supabaseAdmin
    .from("movies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <>
      <Navbar />
      <main className="py-6">
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      </main>
    </>
  );
}
