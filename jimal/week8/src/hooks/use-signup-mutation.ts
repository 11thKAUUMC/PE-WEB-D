import { mutationOptions, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { signup } from "../api/members/signup";

const signupMutationOptions = mutationOptions({ mutationFn: signup });

export function useSignupMutation() {
  const navigate = useNavigate();

  return useMutation({
    ...signupMutationOptions,
    onSuccess: (response) => {
      alert(response.message);

      void navigate({ to: "/login" });
    },
    onError: () => {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    },
  });
}

