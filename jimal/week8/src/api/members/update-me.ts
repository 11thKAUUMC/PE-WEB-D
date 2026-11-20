import { authApi } from "../auth-api";
import { unwrapMemberInfo, type MemberInfoResponse } from "./me";

export interface UpdateMeRequest {
  nickname: string;
}

export async function updateMe(body: UpdateMeRequest) {
  const response = await authApi.patch("members/me", { json: body, retry: 0 }).json<MemberInfoResponse>();
  return { ...response, result: unwrapMemberInfo(response) };
}
