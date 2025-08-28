"use client";
import Link from "next/link";

export default function MovieCard({ movie }) {
  return (
    <div className="bg-[#0e0e0e] rounded-2xl shadow-lg overflow-hidden hover:scale-105 transform transition">
      <Link href={`/movie/${movie.id}`}>
        <div className="relative h-[300px] w-full bg-gray-800">
          {movie.poster_url ? (
            // Use next/image if you want; for startup show img
            <img src={movie.poster_url} alt={movie.title} className="object-cover w-full h-full"/>
          ) : (
            <div className="flex items-center justify-center h-full">No poster</div>
          )}
          <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-sm">
            ₦{Number(movie.price).toFixed(2)}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-lg">{movie.title}</h3>
          <p className="text-sm text-gray-400">{movie.genre} • {movie.year}</p>
        </div>
      </Link>
    </div>
  );
}
