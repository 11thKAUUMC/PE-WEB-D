export const memberApiBaseUrl = (import.meta.env.VITE_MEMBER_API_BASE_URL || "http://localhost:8081").replace(new RegExp("/$"), "");
export type Rating = { ratingId: number; movieId: number; score: number; comment: string | null; createdAt: string; updatedAt: string };
export type RatingPage = { content: Rating[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean };
export type ApiResult<T> = { url: string; status: number; body: T };
export class MemberApiError extends Error {
 readonly result: ApiResult<unknown>;
 constructor(result: ApiResult<unknown>, message: string) { super(message); this.result = result; }
}
async function get<T>(path: string): Promise<ApiResult<T>> {
 const url = memberApiBaseUrl + path;
 let response: Response;
 try { response = await fetch(url); }
 catch { throw new Error("서버에 연결하지 못했어요. 백엔드 실행 상태와 CORS 허용 출처를 확인해 주세요."); }
 const body: unknown = await response.json();
 if (!response.ok) {
  const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string" ? body.message : "요청에 실패했어요.";
  throw new MemberApiError({url, status: response.status, body}, message);
 }
 return {url, status: response.status, body: body as T};
}
export const checkNickname = (value: string) => get<{available: boolean}>("/members/nickname/" + encodeURIComponent(value));
export const checkEmail = (value: string) => get<{available: boolean}>("/members/email/" + encodeURIComponent(value));
export const getMemberRatings = (memberId: number, page: number, size: number) => get<RatingPage>("/members/"+memberId+"/ratings?page="+page+"&size="+size);
