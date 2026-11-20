import { authApi } from "./auth-api";
import type { RatingPage } from "./members";
import { checkMutationResponse } from "./read-result";

export function getTokenMemberId(token: string | null) {
  if (!token) return null;
  try {
    const payload: { sub?: unknown } = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const id = Number(payload.sub);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function getMovieRating(memberId: number, movieId: number, signal: AbortSignal) {
  for (let page = 0; ; page += 1) {
    const result = await authApi.get(`members/${memberId}/ratings`, {
      searchParams: { page, size: 20 },
      signal,
    }).json<RatingPage>();
    const match = result.content.find((rating) => rating.movieId === movieId);
    if (match) return match;
    if (result.last || page + 1 >= result.totalPages) return null;
  }
}

type RatingInput = { score: number; comment: string };
export type RatingChange =
  | { action: "create"; movieId: number; input: RatingInput }
  | { action: "update"; ratingId: number; input: RatingInput }
  | { action: "delete"; ratingId: number };

export async function changeRating(change: RatingChange) {
  const response = change.action === "create"
    ? await authApi.post("ratings", { json: { movieId: change.movieId, ...change.input }, retry: 0 })
    : change.action === "update"
      ? await authApi.patch(`ratings/${change.ratingId}`, { json: change.input, retry: 0 })
      : await authApi.delete(`ratings/${change.ratingId}`, { retry: 0 });
  await checkMutationResponse(response);
}
