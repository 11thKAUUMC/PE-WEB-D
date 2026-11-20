import type { TmdbMovieListItem } from "../../api/movies/models";
import type { Movie } from "../../types/movie";
export type MovieCardData = Pick<Movie, "id" | "title" | "releaseDate" | "posterPath" | "isBookmarked">;
export function toMovieCard(movie: TmdbMovieListItem, bookmarkedIds: number[]): MovieCardData {
  return { id: movie.id, title: movie.title, releaseDate: movie.release_date,
    posterPath: movie.poster_path ? "https://image.tmdb.org/t/p/w500" + movie.poster_path : "/images/poster-placeholder.svg",
    isBookmarked: bookmarkedIds.includes(movie.id) };
}
