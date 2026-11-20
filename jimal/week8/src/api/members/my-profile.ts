import { HTTPError } from "ky";

export function getProfileErrorMessage(error: unknown) {
  if (error instanceof HTTPError) {
    const body: unknown = error.data;
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") return body.message;
    if (error.response.status === 401) return "로그인이 만료됐어요. 다시 로그인해 주세요.";
    return "회원 정보 요청에 실패했어요. 다시 시도해 주세요.";
  }
  return error instanceof Error ? error.message : "서버에 연결하지 못했어요. 다시 시도해 주세요.";
}
