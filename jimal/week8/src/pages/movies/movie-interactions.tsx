import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { changeRating, getMovieRating, getTokenMemberId } from "../../api/ratings";
import type { RatingChange } from "../../api/ratings";
import type { Rating } from "../../api/members";
import { useMovieFavorite } from "../../hooks/use-favorites";
import { useAuthStore } from "../../stores/auth-store";

export function MovieFavoriteButton({ movieId }: { movieId: number }) {
  const { token, query, mutation } = useMovieFavorite(movieId);
  const button = "mt-5 rounded bg-[#4f64e8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";
  if (!token) return <Link to="/login" className={button + " inline-block"}>로그인하고 즐겨찾기 추가</Link>;
  if (query.isError) return <div className="mt-5" role="alert">즐겨찾기 상태를 불러오지 못했어요. <button type="button" onClick={() => void query.refetch()} className="underline">다시 시도</button></div>;
  return (
    <div>
      <button type="button" className={button} aria-pressed={query.data ?? false}
        disabled={query.isPending || mutation.isPending}
        onClick={() => mutation.mutate({ movieId, add: !query.data })}>
        {query.isPending ? "즐겨찾기 확인 중" : query.data ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      </button>
      {mutation.isError && <p role="alert" className="mt-2 text-sm text-red-600">즐겨찾기를 변경하지 못했어요.</p>}
    </div>
  );
}

export function MovieRatingPanel({ movieId }: { movieId: number }) {
  const token = useAuthStore((state) => state.accessToken);
  const memberId = getTokenMemberId(token);
  const client = useQueryClient();
  const queryKey = ["member-ratings", memberId, movieId] as const;
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getMovieRating(memberId!, movieId, signal),
    enabled: memberId !== null,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: changeRating,
    onSuccess: () => client.invalidateQueries({ queryKey: ["member-ratings", memberId] }),
  });

  return (
    <>
      <h2 className="font-bold">내 평점</h2>
      {!token ? <Link to="/login" className="mt-3 inline-block text-sm underline">로그인하고 평점 남기기</Link>
        : memberId === null ? <p role="alert">토큰에서 회원 ID를 확인할 수 없어요.</p>
        : query.isPending ? <p role="status">평점을 불러오는 중이에요.</p>
        : query.isError ? <p role="alert">평점을 불러오지 못했어요. <button type="button" className="underline" onClick={() => void query.refetch()}>다시 시도</button></p>
        : <RatingForm key={JSON.stringify([memberId, movieId, query.data])} rating={query.data} movieId={movieId} mutation={mutation} />}
    </>
  );
}

interface RatingFormProps {
  rating: Rating | null;
  movieId: number;
  mutation: UseMutationResult<void, Error, RatingChange>;
}

function RatingForm({ rating, movieId, mutation }: RatingFormProps) {
  const [score, setScore] = useState(rating?.score ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const button = "rounded bg-[#191b20] px-3 py-2 text-sm text-white disabled:opacity-60";
  return (
    <form className="mt-3 space-y-3" onSubmit={(event) => {
      event.preventDefault();
      if (!score || mutation.isPending) return;
      const input = { score, comment: comment.trim() };
      mutation.mutate(rating ? { action: "update", ratingId: rating.ratingId, input } : { action: "create", movieId, input });
    }}>
      <fieldset disabled={mutation.isPending} className="space-y-3">
        <legend className="text-sm">{rating ? `저장된 평점 ${rating.score}점` : "별점을 선택해 주세요."}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button"
            aria-label={value + "점"} aria-pressed={score === value}
            onClick={() => setScore(value)} className="p-1 text-xl text-[#4f64e8]">{score >= value ? "★" : "☆"}</button>)}
        </div>
        <textarea aria-label="영화 감상" placeholder="영화 감상 (선택)" maxLength={500} rows={4}
          value={comment} onChange={(event) => setComment(event.target.value)}
          className="w-full rounded border border-[#ddd] bg-white p-2 text-sm" />
        <div className="flex gap-2">
          <button type="submit" disabled={!score} className={button}>{rating ? "평점 수정" : "평점 등록"}</button>
          {rating && <button type="button" className="rounded border px-3 text-sm"
            onClick={() => mutation.mutate({ action: "delete", ratingId: rating.ratingId })}>평점 삭제</button>}
        </div>
      </fieldset>
      {mutation.isPending && <p role="status">처리 중이에요.</p>}
      {mutation.isError && <p role="alert" className="text-sm text-red-600">평점 요청에 실패했어요. 다시 시도해 주세요.</p>}
    </form>
  );
}
