import { Link } from "@tanstack/react-router";
import type { Movie } from "../../types/movie";
import { cn } from "../../utils/cn";

interface MovieCardProps {
  movie: Pick<Movie, "id" | "title" | "releaseDate" | "posterPath" | "isBookmarked">;
  onToggleBookmark: (movieId: number) => void;
}

function MovieCard({
  movie,
  onToggleBookmark,
}: MovieCardProps) {
  return (
    <article className="min-w-0">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[8px] bg-[#e5e5e5]">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          className="block h-full"
        >
          <img
            src={movie.posterPath}
            alt={`${movie.title} 포스터`}
            className="block h-full w-full object-cover"
          />
        </Link>

        <button
          className={cn(
            "absolute right-2 top-2 cursor-pointer rounded p-1.5 text-white",
            movie.isBookmarked ? "bg-blue-600" : "bg-black/60",
          )}
          onClick={() => onToggleBookmark(movie.id)}
          aria-pressed={movie.isBookmarked}
          aria-label={
            movie.isBookmarked ? "북마크 해제" : "북마크 추가"
          }
        >
          <img
            className="block h-5 w-5 brightness-0 invert"
            src={
              movie.isBookmarked
                ? "/icons/movie-icons/bookmark.svg"
                : "/icons/movie-icons/bookmark-outline.svg"
            }
            alt=""
          />
        </button>
      </div>

      <h3 className="m-0 mt-[12px] mb-[5px] truncate text-[15px] font-semibold text-[#171717]">
        <Link
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          className="text-inherit no-underline hover:underline"
        >
          {movie.title}
        </Link>
      </h3>
      <p className="m-0 text-[12px] font-normal text-[#8a8a8a]">{movie.releaseDate}</p>
    </article>
  );
}

export default MovieCard;
