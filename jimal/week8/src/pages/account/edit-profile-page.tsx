import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MemberInfo } from "../../api/members/me";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";
import { useAuthStore } from "../../stores/auth-store";
import { getProfileErrorMessage } from "../../api/members/my-profile";
import { useMyProfile } from "./use-my-profile";

function EditProfileForm({ profile }: { profile: MemberInfo }) {
  const [nickname, setNickname] = useState(profile.nickname);
  const updateMeMutation = useUpdateMeMutation();
  const trimmedNickname = nickname.trim();
  const nicknameLength = Array.from(trimmedNickname).length;
  const valid = nicknameLength >= 2 && nicknameLength <= 12;
  const canSubmit = valid && trimmedNickname !== profile.nickname;

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || updateMeMutation.isPending || !useAuthStore.getState().accessToken) return;

    updateMeMutation.mutate({ nickname: trimmedNickname });
  };

  return <form onSubmit={handleSubmit} noValidate className="space-y-4">
    <div>
      <label htmlFor="profile-email" className="mb-1.5 block text-[13px] font-bold">이메일</label>
      <input id="profile-email" type="email" autoComplete="email" readOnly value={profile.email} className="h-12 w-full rounded-lg border border-[#e0e2e9] bg-[#eef0f5] px-3.5 text-sm text-[#666d7c]" aria-describedby="profile-email-help" />
      <p id="profile-email-help" className="mt-1 text-xs text-[#969daa]">이메일은 변경할 수 없어요.</p>
    </div>
    <div>
      <label htmlFor="profile-nickname" className="mb-1.5 block text-[13px] font-bold">닉네임</label>
      <input id="profile-nickname" name="nickname" autoComplete="nickname" required disabled={updateMeMutation.isPending}
        value={nickname} onChange={(event) => setNickname(event.target.value)} aria-invalid={!valid} aria-describedby="profile-nickname-help"
        className="h-12 w-full rounded-lg border border-[#e0e2e9] bg-white px-3.5 text-sm aria-invalid:border-red-500" />
      <p id="profile-nickname-help" aria-live="polite" className={`mt-1 text-xs ${valid ? "text-[#969daa]" : "text-red-600"}`}>닉네임은 2~12자로 입력해 주세요.</p>
    </div>
    <button type="submit" disabled={!canSubmit || updateMeMutation.isPending} className="h-[46px] w-full rounded-lg bg-[#4c60eb] text-sm font-bold text-white enabled:hover:bg-[#3d50d4] disabled:opacity-60">{updateMeMutation.isPending ? "저장 중" : "저장하기"}</button>
    {updateMeMutation.isPending ? <span className="flex h-[46px] items-center justify-center text-sm text-[#969daa]">저장 중이에요.</span> : <Link to="/mypage" className="flex h-[46px] w-full items-center justify-center rounded-lg border border-[#e0e2e9] bg-white text-sm font-bold text-[#666d7c] hover:bg-[#eef0f5]">취소</Link>}
  </form>;
}

export function EditProfilePage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: profile, isPending, error, refetch } = useMyProfile();
  return <main className="flex min-h-[calc(100svh-64px)] flex-1 items-center justify-center px-5 py-14 sm:py-20">
    <section aria-labelledby="edit-profile-title" className="w-full max-w-[426px]">
      <h1 id="edit-profile-title" className="mb-6 text-[32px] leading-tight font-bold tracking-tight">내 정보 수정</h1>
      {!accessToken ? <p className="text-sm text-[#666d7c]">내 정보를 수정하려면 <Link to="/login" className="font-bold text-[#4c60eb]">로그인</Link>해 주세요.</p>
        : isPending ? <p role="status" className="text-sm text-[#666d7c]">내 정보를 불러오는 중이에요.</p>
        : error ? <div><p role="alert" className="text-sm text-red-600">{getProfileErrorMessage(error)}</p><div className="mt-4 flex gap-4 text-sm font-bold text-[#4c60eb]"><button type="button" onClick={() => void refetch()}>다시 시도</button><Link to="/login">다시 로그인</Link></div></div>
        : profile && <EditProfileForm key={accessToken} profile={profile} />}
    </section>
  </main>;
}
