import "./Pagination.css";

export default function Pagination({
  page = 1,
  pageSize = 10,
  totalCount = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  const goTo = (next) => {
    const p = Math.min(Math.max(1, next), safeTotalPages);
    if (p !== page) onPageChange?.(p);
  };

  const pageNumbers = buildPageNumbers(page, safeTotalPages);

  return (
    <div className="pagination">
      <span className="pagination-summary">
        {totalCount === 0
          ? "No results"
          : `Showing ${start}–${end} of ${totalCount}`}
      </span>

      <div className="pagination-controls">
        <label className="pagination-size">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n} onClick={() => onPageChange?.(Number(n))}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          aria-label="Previous page"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden />
        </button>

        <div className="pagination-pages">
          {pageNumbers.map((n, i) =>
            n === "…" ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                className={`pagination-btn pagination-btn--page${n === page ? " is-active" : ""}`}
                onClick={() => goTo(n)}
              >
                {n}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className="pagination-btn"
          disabled={page >= safeTotalPages}
          onClick={() => goTo(page + 1)}
          aria-label="Next page"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function buildPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}
