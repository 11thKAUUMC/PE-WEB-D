import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useLoginMutation } from "../../hooks/use-login-mutation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const loginMutation = useLoginMutation();
  const showEmailError = form.email.length > 0 && !EMAIL_REGEX.test(form.email.trim());
  const canSubmit = EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <main className="flex min-h-[calc(100svh-64px)] flex-1 items-center justify-center px-5 py-14 sm:py-20">
      <section aria-labelledby="login-title" className="w-full max-w-[426px]">
        <h1 id="login-title" className="mb-5 text-[32px] leading-tight font-bold tracking-tight">로그인</h1>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {(["email", "password"] as const).map((key) => (
            <div key={key}>
              <label htmlFor={`login-${key}`} className="mb-1.5 block text-[13px] font-bold">{key === "email" ? "이메일" : "비밀번호"}</label>
              <div className="relative">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="pointer-events-none absolute top-4 left-3.5 h-4 w-4 text-[#72798a]">
                  {key === "email" ? <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6 8 6 8-6" /></> : <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>}
                </svg>
                <input id={`login-${key}`} name={key} type={key === "email" ? "email" : "password"}
                  disabled={loginMutation.isPending}
                  autoComplete={key === "email" ? "email" : "current-password"} required
                  placeholder={key === "email" ? "name@example.com" : "비밀번호"} value={form[key]}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  aria-invalid={key === "email" && showEmailError}
                  aria-describedby={key === "email" && showEmailError ? "login-email-error" : undefined}
                  className="h-12 w-full rounded-lg border border-[#e0e2e9] bg-white pr-3.5 pl-9 text-sm placeholder:text-[#969dad] aria-invalid:border-red-500" />
              </div>
              {key === "email" && showEmailError && <p id="login-email-error" aria-live="polite" className="mt-1 text-xs text-red-600">올바른 이메일 주소를 입력해 주세요.</p>}
            </div>
          ))}
          <button type="submit" disabled={!canSubmit || loginMutation.isPending} className="h-[46px] w-full rounded-lg bg-[#4c60eb] text-sm font-bold text-white transition-colors enabled:hover:bg-[#3d50d4]">{loginMutation.isPending ? "로그인 중" : "로그인"}</button>
        </form>
        <p className="mt-6 text-center text-xs text-[#666d7c]">처음이신가요? <Link to="/signup" className="font-bold text-[#4e63f2] hover:underline">회원가입</Link></p>
      </section>
    </main>
  );
}
