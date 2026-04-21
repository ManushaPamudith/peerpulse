export default function RatingBadge({ averageRating, reviewCount }) {
  if (!reviewCount) {
    return (
      <span className="text-slate-400 text-xs">No reviews yet</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
      ⭐ {averageRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
    </span>
  );
}
