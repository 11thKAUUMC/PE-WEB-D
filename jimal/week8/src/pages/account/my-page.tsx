import { Link, useSearch } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/auth-store";
import { getProfileErrorMessage } from "../../api/members/my-profile";
import { useFavorites } from "../../hooks/use-favorites";
import { useMyProfile } from "./use-my-profile";

export function MyPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: profile, isPending, error, refetch } = useMyProfile();
  const { updated } = useSearch({ from: "/(authenticated)/_auth/mypage" });
  return (
    <main className="flex min-h-[calc(100svh-64px)] flex-1 items-center justify-center px-5 py-14 sm:py-20">
      <section aria-labelledby="profile-title" className="w-full max-w-[426px]">
        <h1 id="profile-title" className="mb-6 text-[32px] leading-tight font-bold tracking-tight">내 정보</h1>
        {!accessToken ? <p className="text-sm text-[#666d7c]">내 정보를 확인하려면 <Link to="/login" className="font-bold text-[#4c60eb]">로그인</Link>해 주세요.</p>
          : isPending ? <p role="status" className="text-sm text-[#666d7c]">내 정보를 불러오는 중이에요.</p>
          : error ? <div><p role="alert" className="text-sm text-red-600">{getProfileErrorMessage(error)}</p><div className="mt-4 flex gap-4 text-sm font-bold text-[#4c60eb]"><button type="button" onClick={() => void refetch()}>다시 시도</button><Link to="/login">다시 로그인</Link></div></div>
          : profile && <>
            {updated && <p role="status" className="mb-5 rounded-lg bg-[#eef0ff] px-4 py-3 text-sm text-[#4c60eb]">내 정보를 수정했어요.</p>}
            <div className="mb-6 flex items-center gap-4 rounded-xl border border-[#e0e2e9] bg-white p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eef0ff]"><img src="/icons/movie-icons/person.svg" alt="" className="h-7 w-7" /></div>
              <div className="min-w-0"><p className="break-all text-lg font-bold">{profile.nickname}</p><p className="mt-1 text-xs text-[#666d7c]">오늘도 영화와 함께하는 하루</p></div>
            </div>
            <dl className="space-y-4">
              <div><dt className="mb-1.5 text-[13px] font-bold">이메일</dt><dd className="flex min-h-12 items-center break-all rounded-lg border border-[#e0e2e9] bg-white px-3.5 py-3 text-sm">{profile.email}</dd></div>
              <div><dt className="mb-1.5 text-[13px] font-bold">닉네임</dt><dd className="flex min-h-12 items-center break-all rounded-lg border border-[#e0e2e9] bg-white px-3.5 py-3 text-sm">{profile.nickname}</dd></div>
              <div><dt className="mb-1.5 text-[13px] font-bold">가입일</dt><dd className="text-sm text-[#666d7c]">{profile.createdAt?.slice(0, 10) || "—"}</dd></div>
            </dl>
            <Link to="/mypage/edit" className="mt-6 flex h-[46px] w-full items-center justify-center rounded-lg bg-[#4c60eb] text-sm font-bold text-white hover:bg-[#3d50d4]">내 정보 수정</Link>
          </>}
        <FavoriteMovies />
      </section>
    </main>
  );
}

function FavoriteMovies() {
  const favorites = useFavorites();
  return (
    <section className="mt-10 border-t border-[#e0e2e9] pt-6" aria-labelledby="favorites-title">
      <h2 id="favorites-title" className="mb-4 text-lg font-bold">즐겨찾기</h2>
      {favorites.isPending ? <p role="status">즐겨찾기를 불러오는 중이에요.</p>
        : favorites.isError ? <p role="alert">즐겨찾기를 불러오지 못했어요. <button type="button" className="underline" onClick={() => void favorites.refetch()}>다시 시도</button></p>
        : favorites.data.length === 0 ? <p>아직 즐겨찾기한 영화가 없어요.</p>
        : <ul className="divide-y divide-[#e0e2e9]">
          {favorites.data.map((movie) => <li key={movie.movieId} className="py-3">
            <Link to="/movies/$movieId" params={{ movieId: String(movie.movieId) }} className="font-semibold hover:underline">
              {movie.title || `영화 #${movie.movieId}`}
            </Link>
          </li>)}
        </ul>}
    </section>
  );
}
