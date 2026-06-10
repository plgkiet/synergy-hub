import "./FlexibleDataTable.css";

/**
 * Presentational table — shape comes entirely from props.
 *
 * @typedef {Object} DataTableColumn
 * @property {string} key - Field on each row object
 * @property {string} label - Header text
 * @property {string} [width] - CSS grid track (e.g. "1fr", "120px")
 * @property {string} [align] - "left" | "center" | "right"
 * @property {(row: object, value: unknown) => React.ReactNode} [render] - Custom cell
 *
 * @param {Object} props
 * @param {DataTableColumn[]} props.columns
 * @param {object[]} props.data
 * @param {string} [props.rowKey]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.className]
 * @param {string} [props.actionsColumnWidth]
 * @param {(row: object) => React.ReactNode} [props.renderActions]
 */
export default function FlexibleDataTable({
  columns = [],
  data = [],
  rowKey = "id",
  emptyMessage = "No data.",
  className = "",
  actionsColumnWidth = "minmax(120px, auto)",
  renderActions,
  onRowClick,
}) {
  const gridTemplate = [
    ...columns.map((col) => col.width || "minmax(100px, 1fr)"),
    ...(renderActions ? [actionsColumnWidth] : []),
  ].join(" ");

  return (
    <div className={`fdt-wrap ${className}`.trim()}>
      <div className="fdt-scroll">
        <div
          className="fdt-grid fdt-grid--header"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className="fdt-cell fdt-cell--header"
              style={{ textAlign: col.align || "left" }}
            >
              {col.label}
            </div>
          ))}
          {renderActions && (
            <div className="fdt-cell fdt-cell--header fdt-cell--actions-head">
              Actions
            </div>
          )}
        </div>

        {data.length === 0 ? (
          <div className="fdt-empty">{emptyMessage}</div>
        ) : (
          data.map((row) => (
            <div
              key={row[rowKey]}
              className={`fdt-grid fdt-grid--row ${
                onRowClick ? "fdt-grid--clickable" : ""
              }`}
              style={{ gridTemplateColumns: gridTemplate }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => {
                const value = row[col.key];
                return (
                  <div
                    key={col.key}
                    className="fdt-cell"
                    style={{ textAlign: col.align || "left" }}
                  >
                    {col.render ? (
                      col.render(row, value)
                    ) : (
                      <span className="fdt-text">{value ?? "—"}</span>
                    )}
                  </div>
                );
              })}
              {renderActions && (
                <div className="fdt-cell fdt-cell--actions">
                  {renderActions(row)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
