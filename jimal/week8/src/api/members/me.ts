import { authApi } from "../auth-api";

export interface MemberInfo {
  email: string;
  nickname: string;
  createdAt: string;
}

export interface MemberInfoResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: MemberInfo | null;
}

export function unwrapMemberInfo(response: MemberInfoResponse) {
  if (!response.isSuccess || !response.result) throw new Error(response.message || "회원 정보 요청에 실패했어요.");
  return response.result;
}

export async function getMe(signal?: AbortSignal): Promise<MemberInfo> {
  return unwrapMemberInfo(await authApi.get("members/me", { signal, retry: 0 }).json<MemberInfoResponse>());
}
