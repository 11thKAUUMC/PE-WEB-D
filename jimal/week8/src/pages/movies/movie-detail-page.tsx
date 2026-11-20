import { Link, useParams } from "@tanstack/react-router";
import { MovieFavoriteButton, MovieRatingPanel } from "./movie-interactions";
import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../../api/movies/movie-query-options";
import type { TmdbMovieDetail } from "../../api/movies/models";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({ from: "/movies/$movieId" });
  const movieId = Number(movieIdParam);
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

  const movieDetailQuery = useQuery(movieQueries.detail(movieId));

  if (!isValidMovieId) return <DetailMessage message="올바르지 않은 영화 번호예요." isError />;
  if (movieDetailQuery.isPending) return <DetailMessage message="영화 정보를 불러오는 중이에요." />;
  if (movieDetailQuery.isError) return <DetailMessage message={getMovieDetailErrorMessage(movieDetailQuery.error)} isError onRetry={() => { void movieDetailQuery.refetch(); }} />;
  return <MovieDetail movie={movieDetailQuery.data} />;
}

function DetailMessage({ message, isError = false, onRetry }: { message: string; isError?: boolean; onRetry?: () => void }) {
  return <main role={isError ? "alert" : "status"} className="mx-auto w-full max-w-7xl px-4 py-20 text-center"><p>{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-4 rounded border px-4 py-2">다시 시도</button>}</main>;
}

function MovieDetail({ movie }: { movie: TmdbMovieDetail }) {
  const runtime = typeof movie.runtime === "number"
    ? `${Math.floor(movie.runtime / 60)}시간 ${movie.runtime % 60}분`
    : "상영 시간 정보가 없어요.";
  return (
    <main className="w-full flex-1">
      <section className="relative h-72 overflow-hidden bg-[#292b31] text-white sm:h-80">
        {movie.backdrop_path && <img src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-between px-4 py-6 sm:px-8 lg:px-14">
          <Link to="/" className="w-fit text-xs hover:underline">‹ 영화 목록</Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{movie.title}</h1>
            <p className="mt-2 text-sm text-white/80">{movie.original_title}</p>
            <p className="mt-2 text-xs text-white/80">{movie.release_date} · {movie.genres.map((genre) => genre.name).join(", ")} · {runtime}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:grid-cols-[160px_1fr] sm:px-8 lg:grid-cols-[180px_1fr_280px] lg:px-14">
        <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/images/poster-placeholder.svg"} alt={movie.title + " 포스터"} className="aspect-[2/3] w-36 rounded-md object-cover shadow-lg sm:w-full" />
        <div>
          <h2 className="text-lg font-bold">{movie.tagline}</h2>
          <p className="mt-4 text-sm leading-7 text-[#666]">{movie.overview}</p>
          <MovieFavoriteButton movieId={movie.id} />
        </div>
        <aside className="border-t border-[#e5e7eb] pt-5 sm:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <MovieRatingPanel key={movie.id} movieId={movie.id} />
        </aside>
      </section>
    </main>
  );
}
