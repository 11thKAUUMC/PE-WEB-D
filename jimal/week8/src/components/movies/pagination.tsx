export default function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (page: number) => void;
}) {
  return <nav aria-label="영화 목록 페이지" className="mt-10 flex items-center justify-center gap-2">
    <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="이전 페이지" className="h-8 w-8 disabled:text-gray-300">‹</button>
    <span aria-current="page">{page} / {Math.max(1, totalPages)}</span>
    <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="다음 페이지" className="h-8 w-8 disabled:text-gray-300">›</button>
  </nav>;
}
