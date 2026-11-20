import { useBookmarkStore } from "../../stores/bookmark-store";
import { useDisplayStore } from "../../stores/display-store";
import MovieGrid from "../../components/movies/movie-grid";
import Pagination from "../../components/movies/pagination";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { movieQueries } from "../../api/movies/movie-query-options";
import { toMovieCard } from "../../utils/movies/to-movie-card";

export function MovieListPage() {
  const { page = 1 } = useSearch({ from: "/" });
  return <MovieListContent key={page} page={page} />;
}

function MovieListContent({ page }: { page: number }) {
  const navigate = useNavigate({ from: "/" });
  const moviesQuery = useQuery(movieQueries.list(page));
  const { bookmarkedIds, toggleBookmark } = useBookmarkStore();
  const { cardSize, setCardSize } = useDisplayStore();
  const movies = (moviesQuery.data?.results ?? []).map((movie) =>
    toMovieCard(movie, bookmarkedIds),
  );
  const totalPages = Math.min(500, moviesQuery.data?.total_pages ?? 0);

  const handlePageChange = (nextPage: number) => {
    void navigate({ search: { page: nextPage } });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-14">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">영화 목록</h1>
        <label className="flex items-center gap-2 text-sm text-[#666]">
          카드 크기
          <select aria-label="카드 크기" value={cardSize} onChange={(event) => setCardSize(event.target.value === "large" ? "large" : "normal")} className="rounded border border-[#ddd] bg-white px-3 py-2">
            <option value="normal">기본</option>
            <option value="large">크게</option>
          </select>
        </label>
      </div>

      {moviesQuery.isPending ? (
        <p role="status" className="py-20 text-center">영화 목록을 불러오는 중이에요.</p>
      ) : moviesQuery.isError ? (
        <div role="alert" className="py-20 text-center">
          <p>{moviesQuery.error.message}</p>
          <button type="button" className="mt-4 rounded border px-4 py-2" onClick={() => { void moviesQuery.refetch(); }}>다시 시도</button>
        </div>
      ) : movies.length === 0 ? (
        <p role="status" className="py-20 text-center">조건에 맞는 영화가 없어요.</p>
      ) : (
        <>
          <MovieGrid movies={movies} onToggleBookmark={toggleBookmark} />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
}
