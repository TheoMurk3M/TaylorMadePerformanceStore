import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  color?: string;
  className?: string;
}

const StarRating = ({
  rating,
  max = 5,
  size = 16,
  color = "text-yellow-400",
  className = "",
}: StarRatingProps) => {
  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className={`fill-current ${color}`}
        />
      ))}

      {/* Half star */}
      {hasHalfStar && <StarHalf size={size} className={`${color}`} />}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={size}
          className="text-gray-300"
        />
      ))}
    </div>
  );
};

export default StarRating;
