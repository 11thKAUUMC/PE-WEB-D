import { useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import { checkNickname, checkEmail, getMemberRatings, MemberApiError, type ApiResult, type RatingPage } from "../../api/members";
const inputClass = "min-w-0 flex-1 rounded-md border border-[#ddd] bg-white px-3 py-2 text-sm";
const buttonClass = "rounded-md bg-[#191b20] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40";
function Evidence({result}: {result: ApiResult<unknown> | null}) {
 return result && <details className="mt-4 text-xs text-[#666]"><summary className="cursor-pointer">요청 및 응답 확인 · HTTP {result.status}</summary><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all rounded bg-[#f5f6fa] p-3">GET {result.url}{"\n"}HTTP {result.status}{"\n"}{JSON.stringify(result.body,null,2)}</pre></details>;
}
function Availability({kind}: {kind: "nickname" | "email"}) {
 const label = kind === "nickname" ? "닉네임" : "이메일";
 const [value,setValue] = useState("");
 const [busy,setBusy] = useState(false);
 const [message,setMessage] = useState("");
 const [failed,setFailed] = useState(false);
 const [result,setResult] = useState<ApiResult<unknown> | null>(null);
 async function submit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true); setMessage(""); setResult(null); setFailed(false);
  try { const response = await (kind === "nickname" ? checkNickname(value) : checkEmail(value)); setResult(response); setMessage(response.body.available ? "사용 가능한 "+label+"이에요." : "이미 사용 중인 "+label+"이에요."); }
  catch(error) { setFailed(true); setMessage(error instanceof Error ? error.message : "요청에 실패했어요."); if(error instanceof MemberApiError) setResult(error.result); }
  finally { setBusy(false); }
 }
 return <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
  <h2 className="text-lg font-bold">{label} 중복 확인</h2><p className="mt-2 text-sm text-[#888]">{kind === "nickname" ? "2~12자의 닉네임을 입력해 주세요." : "이메일 주소의 사용 가능 여부를 확인해요."}</p>
  <form onSubmit={submit} noValidate className="mt-5 flex flex-wrap gap-2"><label htmlFor={kind} className="sr-only">{label}</label><input id={kind} type="text" autoComplete="off" value={value} disabled={busy} onChange={event=>{setValue(event.target.value);setMessage("");setResult(null);}} placeholder={kind === "nickname" ? "닉네임 입력" : "name@example.com"} className={inputClass}/><button disabled={busy || !value} className={buttonClass}>{busy ? "확인 중…" : "중복 확인"}</button></form>
  <p role={failed ? "alert" : "status"} className={"mt-3 text-sm "+(failed ? "text-red-600" : "text-[#4f64e8]")}>{message}</p><Evidence result={result}/>
 </section>;
}
export function MyPage() {
 const [memberId,setMemberId] = useState("1");
 const [size,setSize] = useState("10");
 const [query,setQuery] = useState<{memberId:number;size:number}|null>(null);
 const [data,setData] = useState<RatingPage|null>(null);
 const [result,setResult] = useState<ApiResult<unknown>|null>(null);
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState("");
 async function load(q: {memberId:number;size:number},page: number) {
  setBusy(true);setError("");setData(null);setResult(null);
  try {const response=await getMemberRatings(q.memberId,page,q.size);setData(response.body);setResult(response);setQuery(q);}
  catch(e){setError(e instanceof Error ? e.message : "평점을 불러오지 못했어요.");if(e instanceof MemberApiError)setResult(e.result);}
  finally{setBusy(false);}
 }
 function submit(event: SubmitEvent<HTMLFormElement>){event.preventDefault();void load({memberId:Number(memberId),size:Number(size)},0);}
 return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:px-14">
  <h1 className="text-2xl font-bold tracking-tight">마이페이지</h1><p className="mt-2 mb-6 text-sm text-[#888]">닉네임과 이메일을 확인하고, 회원의 영화 감상을 모아 보세요.</p>
  <div className="grid gap-5 md:grid-cols-2"><Availability kind="nickname"/><Availability kind="email"/></div>
  <section className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-6"><h2 className="text-lg font-bold">회원의 평점</h2><p className="mt-2 text-sm text-[#888]">조회할 회원을 선택해 주세요.</p>
  <form onSubmit={submit} className="my-5 flex flex-wrap items-end gap-3"><label className="flex flex-col gap-2 text-sm">회원 ID<input required min="1" step="1" type="number" value={memberId} disabled={busy} onChange={e=>setMemberId(e.target.value)} className={inputClass}/></label><label className="flex flex-col gap-2 text-sm">페이지당 개수<select value={size} disabled={busy} onChange={e=>setSize(e.target.value)} className={inputClass}><option value="5">5개</option><option value="10">10개</option><option value="20">20개</option></select></label><button disabled={busy} className={buttonClass}>{busy ? "불러오는 중…" : "평점 조회"}</button></form>
  {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  {data && <><p role="status" className="mb-3 text-sm text-[#888]">전체 {data.totalElements}개의 평점 · {data.totalPages === 0 ? 0 : data.page+1} / {data.totalPages} 페이지</p>
  {data.content.length === 0 ? <p className="py-10 text-center text-sm text-[#888]">등록된 평점이 없어요.</p> : <ul className="divide-y divide-[#eee]">{data.content.map(rating=><li key={rating.ratingId} className="py-4"><div className="flex flex-wrap justify-between gap-2"><Link to="/movies/$movieId" params={{movieId:String(rating.movieId)}} className="font-semibold hover:underline">영화 #{rating.movieId}</Link><span className="font-bold text-[#4f64e8]">평점 {rating.score}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-[#666]">{rating.comment || "작성한 감상이 없어요."}</p><p className="mt-2 text-xs text-[#999]">평점 #{rating.ratingId} · {rating.createdAt.replace("T"," ")}</p></li>)}</ul>}
  <div className="mt-5 flex justify-center gap-3"><button disabled={busy || data.first} className={buttonClass} onClick={()=>{if(query)void load(query,data.page-1);}}>이전</button><button disabled={busy || data.last} className={buttonClass} onClick={()=>{if(query)void load(query,data.page+1);}}>다음</button></div></>}
  {!data && !busy && !error && <p className="py-8 text-center text-sm text-[#888]">회원 ID를 입력하고 평점을 조회해 주세요.</p>}<Evidence result={result}/></section>
 </main>;
}
