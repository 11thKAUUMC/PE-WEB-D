import MovieCard from "./movie-card";
import type { Movie } from "../../types/movie";
import { useDisplayStore } from "../../stores/display-store";
import { cn } from "../../utils/cn";

interface MovieGridProps {
  movies: Pick<Movie, "id" | "title" | "releaseDate" | "posterPath" | "isBookmarked">[];
  onToggleBookmark: (movieId: number) => void;
}

function MovieGrid({ movies, onToggleBookmark }: MovieGridProps) {
  const cardSize = useDisplayStore((state) => state.cardSize);
  return (
    <div className={cn("grid gap-x-4 gap-y-7 sm:gap-x-6", cardSize === "large" ? "grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5")}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}

export default MovieGrid;
