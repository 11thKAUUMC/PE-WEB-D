import Pagination from "../../components/movies/pagination";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { movieQueries } from "../../api/movies/movie-query-options";
import { cn } from "../../utils/cn";
import { useBookmarkStore } from "../../stores/bookmark-store";

export function SearchPage() {
  const { query, page = 1 } = useSearch({ from: "/search" });
  return <SearchContent key={(query ?? "") + ":" + page} query={query ?? ""} page={page} />;
}

function SearchContent({ query, page }: { query: string; page: number }) {
  const { bookmarkedIds, toggleBookmark } = useBookmarkStore();
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(query ?? "");
  const normalizedQuery = query.trim();
  const searchQuery = useQuery(movieQueries.search(normalizedQuery, page));
  const searchResults = searchQuery.data?.results ?? [];
  const totalPages = Math.min(500, searchQuery.data?.total_pages ?? 0);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    void navigate({ search: nextQuery ? { query: nextQuery } : {} });
  }

  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-14", !normalizedQuery && "flex flex-1 flex-col items-center pt-[18vh]")}>
      <h1 className={cn("mb-5 text-2xl font-bold tracking-tight", !normalizedQuery && "text-center")}>
        {normalizedQuery ? "영화 검색" : "어떤 영화를 찾고 있나요?"}
      </h1>
      <form onSubmit={handleSubmit} role="search" className={cn("flex w-full items-center gap-3 rounded-md border border-[#e2e3e8] bg-white px-4 py-2", !normalizedQuery && "max-w-xl shadow-md")}>
        <img src="/icons/movie-icons/search.svg" alt="" className="h-4 w-4 shrink-0" />
        <input type="search" aria-label="검색어" placeholder="영화 제목을 입력하세요" value={searchText}
          onChange={(event) => setSearchText(event.target.value)} className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none" />
        <button type="submit" className="shrink-0 rounded bg-[#191b20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#333]">검색</button>
      </form>
      {!normalizedQuery ? <p className="mt-4 text-sm text-[#8a8a8a]">검색어를 입력해 주세요.</p> : (
        <>
          <div className="my-5 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">‘{query?.trim()}’ 검색 결과</h2>
            {searchQuery.isSuccess && <p aria-live="polite" className="shrink-0 text-xs text-[#8a8a8a]">영화 {searchResults.length}편</p>}
          </div>
          {searchQuery.isLoading ? <p role="status" className="py-20 text-center text-sm text-[#8a8a8a]">검색 결과를 불러오는 중이에요.</p>
          : searchQuery.isError ? <div role="alert" className="py-20 text-center"><p>{searchQuery.error.message}</p><button type="button" className="mt-4 rounded border px-4 py-2" onClick={() => { void searchQuery.refetch(); }}>다시 시도</button></div>
          : searchQuery.isSuccess && searchResults.length === 0 ? <p className="py-20 text-center text-sm text-[#8a8a8a]">검색 결과가 없어요. 다른 검색어를 입력해 보세요.</p> : (
            <><ul className="grid gap-x-8 sm:grid-cols-2">
              {searchResults.map((movie) => (
                <li key={movie.id} className="flex min-w-0 gap-4 border-b border-[#e5e7eb] py-5">
                  <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="shrink-0">
                    <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/images/poster-placeholder.svg"} alt={movie.title + " 포스터"} className="aspect-[2/3] w-24 rounded-md object-cover sm:w-28" />
                  </Link>
                  <div className="flex min-w-0 flex-col items-start">
                    <h3 className="text-sm font-bold"><Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="hover:underline">{movie.title}</Link></h3>
                    <p className="mt-1 text-xs text-[#8a8a8a]">{movie.original_title}</p>
                    <p className="mt-1 text-xs text-[#8a8a8a]">{movie.release_date}</p>
                    <p className="mt-3 text-xs leading-relaxed text-[#666]">{movie.overview}</p>
                    <button type="button" aria-pressed={bookmarkedIds.includes(movie.id)} onClick={() => toggleBookmark(movie.id)}
                      className={cn("mt-3 rounded border px-3 py-1.5 text-xs", bookmarkedIds.includes(movie.id) ? "border-[#4f64e8] bg-[#4f64e8] text-white" : "border-[#ddd] bg-white text-[#666]")}>
                      {bookmarkedIds.includes(movie.id) ? "북마크 해제" : "북마크 추가"}
                    </button>
                    <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }} className="mt-auto pt-4 text-xs font-semibold text-[#4f64e8] hover:underline">상세 보기 →</Link>
                  </div>
                </li>
              ))}
            </ul><Pagination page={page} totalPages={totalPages} onPageChange={(page) => { void navigate({ search: { query, page } }); }} /></>
          )}
        </>
      )}
    </main>
  );
}
