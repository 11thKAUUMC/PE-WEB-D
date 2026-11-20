import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { MemberInfo } from "../api/members/me";
import { updateMe } from "../api/members/update-me";
import { meQueryKey } from "../pages/account/use-my-profile";
import { useAuthStore } from "../stores/auth-store";

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateMe,
    onMutate: () => useAuthStore.getState().accessToken,
    onSuccess: (response, _request, sessionToken) => {
      if (!sessionToken || useAuthStore.getState().accessToken !== sessionToken) return;

      void queryClient.cancelQueries({ queryKey: meQueryKey });
      queryClient.setQueryData<MemberInfo>(meQueryKey, response.result);
      alert("내 정보 수정에 성공했어요.");
      void navigate({ to: "/mypage", search: { updated: true } });
    },
    onError: () => {
      alert("내 정보 수정에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
