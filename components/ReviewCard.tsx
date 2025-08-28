"use client";

export default function ReviewCard({ review }: { review: any }) {
  return (
    <div className="bg-gray-900 p-3 rounded-xl shadow-md">
      <p className="text-gray-300 text-sm">{review.comment}</p>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>⭐ {review.rating}</span>
        <span>{review.username}</span>
      </div>
    </div>
  );
}
