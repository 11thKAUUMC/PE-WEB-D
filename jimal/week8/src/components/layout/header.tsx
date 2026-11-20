import { Link, useRouterState } from "@tanstack/react-router";
import { useMyProfile } from "../../pages/account/use-my-profile";
import { cn } from "../../utils/cn";
import { useAuthStore } from "../../stores/auth-store";

export function Header() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const meQuery = useMyProfile();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <header className="h-16 shrink-0 border-b border-[#eee] bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-14">
        <div className="flex items-center gap-5 sm:gap-9">
          <Link to="/" aria-label="UMCine 홈" className="flex items-center gap-1.5 text-lg font-black">
            <img src="/icons/movie-icons/movie.svg" alt="" className="h-6 w-6 rounded-md border-2 border-[#111] p-0.5" />UMCine
          </Link>
          <nav aria-label="주 메뉴" className="flex gap-4 text-sm sm:gap-7">
            {[{ to: "/" as const, label: "영화" }, { to: "/search" as const, label: "검색" }, { to: "/mypage" as const, label: "마이페이지" }].map(({ to, label }) => (
              <Link key={to} to={to} search={{}} aria-current={pathname === to ? "page" : undefined}
                className={cn("border-b-2 border-transparent pb-1 text-[#666] hover:text-[#111]", pathname === to && "border-[#111] font-semibold text-[#111]")}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
        <Link to="/search" search={{}} aria-label="영화 검색" className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#eee] hover:bg-[#f5f6fa]">
          <img src="/icons/movie-icons/search.svg" alt="" className="h-4 w-4" />
        </Link>
        {accessToken ? <>
          {meQuery.isLoading ? (
            <span role="status" aria-label="내 정보 조회 중" className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : (
            <Link to="/mypage" className="flex h-10 items-center rounded-lg border border-[#e0e2e9] px-3 text-sm font-bold text-[#666d7c]">마이페이지</Link>
          )}
          <button type="button" onClick={() => setAccessToken(null)} className="h-10 rounded-lg border border-[#e0e2e9] bg-white px-3 text-sm font-bold text-[#666d7c]">로그아웃</button>
        </> : <Link to="/login" className="flex h-10 items-center justify-center rounded-lg bg-[#4c60eb] px-4 text-sm font-bold text-white hover:bg-[#3d50d4]">로그인</Link>}
        </div>
      </div>
    </header>
  );
}

