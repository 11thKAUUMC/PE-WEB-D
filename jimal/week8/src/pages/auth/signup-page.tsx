import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSignupMutation } from "../../hooks/use-signup-mutation";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
const DEFAULT_FORM = { email: "", nickname: "", password: "", passwordConfirm: "" };
type FormKey = keyof typeof DEFAULT_FORM;
type CheckField = "email" | "nickname";
const DEFAULT_DUPLICATE_CHECK = { isChecking: false, isAvailable: false };
const inputClass = "h-12 w-full rounded-lg border border-[#e0e2e9] bg-white px-3.5 text-sm placeholder:text-[#969dad] aria-invalid:border-red-500";

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });
  const signupMutation = useSignupMutation();
  const valid = {
    email: EMAIL_REGEX.test(form.email.trim()),
    nickname: form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12,
    password: PASSWORD_REGEX.test(form.password),
    passwordConfirm: form.passwordConfirm.length > 0 && form.password === form.passwordConfirm,
  };
  const errors = {
    email: "올바른 이메일 주소를 입력해 주세요.",
    nickname: "닉네임은 2~12자로 입력해 주세요.",
    password: "영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상 입력해 주세요.",
    passwordConfirm: "비밀번호가 일치하지 않아요.",
  };
  const isFormValid = Object.values(valid).every(Boolean);
  const canSubmit = isFormValid && duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable && !duplicateCheck.email.isChecking &&
    !duplicateCheck.nickname.isChecking;
  function handleChangeField(key: FormKey, value: string) {
    if (signupMutation.isPending) return;
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  async function handleCheck(key: CheckField) {
    if (!valid[key] || duplicateCheck[key].isChecking || signupMutation.isPending) return;
    const value = form[key].trim();
    setDuplicateCheck((prev) => ({ ...prev, [key]: { isChecking: true, isAvailable: false } }));
    const label = key === "email" ? "이메일" : "닉네임";
    try {
      const response = await (key === "email" ? checkEmailDuplicate(value) : checkNicknameDuplicate(value));
      const isAvailable = response.available === true;
      setDuplicateCheck((prev) => ({ ...prev, [key]: { ...prev[key], isAvailable } }));
      alert(isAvailable ? `사용할 수 있는 ${label}이에요.` : `이미 사용 중인 ${label}이에요.`);
    } catch {
      setDuplicateCheck((prev) => ({ ...prev, [key]: { ...prev[key], isAvailable: false } }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({ ...prev, [key]: { ...prev[key], isChecking: false } }));
    }
  }
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || signupMutation.isPending) return;

    signupMutation.mutate({
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    });
  };
  return (
    <main className="flex min-h-[calc(100svh-64px)] flex-1 items-center justify-center px-5 py-14 sm:py-20">
      <section aria-labelledby="signup-title" className="w-full max-w-[426px]">
        <h1 id="signup-title" className="mb-5 text-[32px] leading-tight font-bold tracking-tight">회원가입</h1>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {(["email", "nickname", "password", "passwordConfirm"] as const).map((key) => {
            const showError = form[key].length > 0 && !valid[key];
            const checkField = key === "email" || key === "nickname" ? key : null;
            const label = { email: "이메일", nickname: "닉네임", password: "비밀번호", passwordConfirm: "비밀번호 확인" }[key];
            return (
              <div key={key}>
                <label htmlFor={`signup-${key}`} className="mb-1.5 block text-[13px] font-bold">{label}</label>
                <div className="relative">
                  <input id={`signup-${key}`} name={key} required
                    disabled={signupMutation.isPending || (checkField ? duplicateCheck[checkField].isChecking : false)}
                    type={key === "email" ? "email" : key === "nickname" ? "text" : "password"}
                    autoComplete={key === "email" ? "email" : key === "nickname" ? "nickname" : "new-password"}
                    placeholder={{ email: "name@example.com", nickname: "2–12자", password: "8자 이상", passwordConfirm: "다시 입력" }[key]}
                    value={form[key]} onChange={(event) => handleChangeField(key, event.target.value)}
                    aria-invalid={showError} aria-describedby={showError || key === "password" ? `signup-${key}-message` : undefined}
                    className={`${inputClass} ${checkField ? "pr-24" : ""}`} />
                  {checkField && <button type="button" disabled={signupMutation.isPending || !valid[checkField] || duplicateCheck[checkField].isChecking}
                    onClick={() => void handleCheck(checkField)}
                    className="absolute inset-y-0 right-3.5 text-xs font-bold text-[#4e63f2] disabled:opacity-50">
                    {duplicateCheck[checkField].isChecking ? "확인 중" : "중복 확인"}
                  </button>}
                </div>
                <div id={`signup-${key}-message`} aria-live="polite">
                  {showError ? <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                    : key === "password" && <p className="mt-1 text-[10px] text-[#969daa]">영문 대소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요</p>}
                </div>
              </div>
            );
          })}
          <button type="submit" disabled={!canSubmit || signupMutation.isPending} className="h-[46px] w-full rounded-lg bg-[#4c60eb] text-sm font-bold text-white transition-colors hover:bg-[#3d50d4] disabled:opacity-60">{signupMutation.isPending ? "가입 중" : "가입하기"}</button>
        </form>
        <p className="mt-4 text-center text-xs text-[#666d7c]">이미 계정이 있나요? <Link to="/login" className="font-bold text-[#4e63f2] hover:underline">로그인</Link></p>
      </section>
    </main>
  );
}


