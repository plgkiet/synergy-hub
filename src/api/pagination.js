/**
 * Parses paginated API responses shaped like:
 * { success, data: { data: [], totalCount, pageIndex, pageSize, totalPages } }
 */
export function extractPaginated(res, { pageIndex = 1, pageSize = 10 } = {}) {
  const envelope = res?.data ?? res;
  const items = Array.isArray(envelope?.data)
    ? envelope.data
    : Array.isArray(envelope?.items)
      ? envelope.items
      : Array.isArray(envelope)
        ? envelope
        : [];

  const totalCount = envelope?.totalCount ?? items.length;
  const reportedPageSize = envelope?.pageSize ?? pageSize;
  const totalPages =
    envelope?.totalPages ??
    (reportedPageSize > 0
      ? Math.max(1, Math.ceil(totalCount / reportedPageSize))
      : 1);

  const resolvedPageIndex =
    envelope?.pageIndex ?? envelope?.pageNumber ?? pageIndex;

  // Server returned every row in one response — slice locally
  if (items.length > pageSize && items.length >= totalCount && totalCount > pageSize) {
    const start = (pageIndex - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      totalCount,
      pageIndex,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
  }

  return {
    items,
    totalCount,
    pageIndex: resolvedPageIndex,
    pageSize: reportedPageSize,
    totalPages,
  };
}
