import { authApi } from "./auth-api";
import { checkMutationResponse, readResult } from "./read-result";

export interface Favorite {
  movieId: number;
  title?: string;
}

type Envelope<T> = { isSuccess: boolean; message: string; result: T };

export async function getFavorites(signal: AbortSignal) {
  const response = await authApi.get("favorites", { signal })
    .json<Favorite[] | { content: Favorite[] } | Envelope<Favorite[] | { content: Favorite[] }>>();
  const result = readResult(response);
  const items = Array.isArray(result) ? result : result?.content;
  if (!Array.isArray(items) || items.some((item) => !Number.isSafeInteger(item.movieId))) {
    throw new Error("즐겨찾기 목록 응답을 확인해 주세요.");
  }
  return items;
}

export async function getFavorite(movieId: number, signal: AbortSignal) {
  const response = await authApi.get(`favorites/${movieId}`, { signal })
    .json<boolean | { isFavorite: boolean } | Envelope<boolean | { isFavorite: boolean }>>();
  const result = readResult(response);
  if (typeof result === "boolean") return result;
  if (typeof result?.isFavorite === "boolean") return result.isFavorite;
  throw new Error("즐겨찾기 여부 응답을 확인해 주세요.");
}

export async function changeFavorite(movieId: number, add: boolean) {
  const response = add
    ? await authApi.post("favorites", { json: { movieId }, retry: 0 })
    : await authApi.delete(`favorites/${movieId}`, { retry: 0 });
  await checkMutationResponse(response);
}
