import { RefreshCw } from "lucide-react";
import { colors } from "../../theme";

/**
 * Production DataTable — owns table structure and common UI states.
 *
 * Screens configure via columns + data + state props; they should not pass
 * raw <tr>/<td> markup for loading, skeleton, error, or empty states.
 *
 * Column shape:
 *   { key, header, headerClassName, headerStyle, cellClassName, cellStyle,
 *     accessor, render(row, index), skeletonWidth, skeletonClassName, align }
 */

const FONT = "'Montserrat', sans-serif";
const DEFAULT_DIVIDER = `1px solid ${colors.borderSubtle}`;

/** Shared th typography — same font + color on every table */
const HEADER_TEXT = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "16px",
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: colors.white,
};

const DEFAULT_STATE_CELL = {
  className: "py-6 px-5 text-sm",
  style: { fontFamily: FONT, color: colors.textSecondary },
};

const DEFAULT_ERROR_SIMPLE = {
  className: "py-6 px-5 text-sm",
  style: { fontFamily: FONT, color: colors.dangerSoft },
};

const DEFAULT_ERROR_RICH = {
  cellClassName: "px-8 py-8",
  titleColor: colors.dangerSoft,
  messageColor: colors.textSecondary,
  buttonBg: colors.button,
  buttonColor: colors.white,
};

function stripHeaderTextStyles(style) {
  if (!style || typeof style !== "object") return undefined;
  const {
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing,
    textTransform,
    color,
    ...rest
  } = style;
  void fontFamily;
  void fontWeight;
  void fontSize;
  void lineHeight;
  void letterSpacing;
  void textTransform;
  void color;
  return Object.keys(rest).length ? rest : undefined;
}

function resolveStyle(style, row, rowIndex) {
  if (typeof style === "function") return style(row, rowIndex);
  return style;
}

function resolveClassName(className, row, rowIndex) {
  if (typeof className === "function") return className(row, rowIndex);
  return className;
}

function buildDividerStyle(divided, divider, rowIndex, rowCount) {
  if (!divided) return undefined;
  const edge = divided === true || divided === "top" ? "top" : divided;
  const borderValue = divider || DEFAULT_DIVIDER;

  if (edge === "top") {
    if (rowIndex === 0) return undefined;
    return { borderTop: borderValue };
  }
  if (edge === "bottom") {
    if (rowIndex >= rowCount - 1) return undefined;
    return { borderBottom: borderValue };
  }
  return undefined;
}

function StateRow({ colCount, className, style, children }) {
  return (
    <tr>
      <td colSpan={colCount} className={className} style={style}>
        {children}
      </td>
    </tr>
  );
}

function SkeletonRows({ columns, count, rowClassName, rowStyle, divider, getSkeletonCellClassName }) {
  return Array.from({ length: count }, (_, i) => {
    const dividerStyle = buildDividerStyle(
      divider ? "top" : false,
      typeof divider === "string" ? divider : undefined,
      i,
      count
    );
    const style =
      typeof rowStyle === "function"
        ? { ...dividerStyle, ...rowStyle(i) }
        : { ...dividerStyle, ...rowStyle };

    return (
      <tr key={`sk-${i}`} className={resolveClassName(rowClassName, null, i)} style={style}>
        {columns.map((column, j) => {
          const width = column.skeletonWidth ?? (j === 0 ? "70%" : "48%");
          const alignRight =
            column.align === "right" ||
            String(column.headerClassName || "").includes("text-right") ||
            String(column.cellClassName || "").includes("text-right");

          return (
            <td
              key={column.key}
              className={
                getSkeletonCellClassName?.(column, j) ??
                column.skeletonClassName ??
                column.cellClassName
              }
            >
              <div
                className="h-4 rounded animate-pulse"
                style={{
                  width,
                  backgroundColor: colors.skeleton,
                  marginLeft: alignRight ? "auto" : undefined,
                }}
              />
            </td>
          );
        })}
      </tr>
    );
  });
}

export default function DataTable({
  columns = [],
  data = [],
  getRowKey = (row, index) => row?.id ?? index,

  // Loading
  isLoading = false,
  loadingMessage,
  loadingClassName,
  loadingStyle,
  skeletonRows = 0,
  skeletonRowClassName,
  skeletonRowStyle,
  skeletonDivider,

  // Error — pass message (+ optional title/retry); DataTable owns the markup
  isError = false,
  error,
  errorTitle,
  onRetry,
  isRetrying = false,
  errorClassName,
  errorStyle,
  errorCellClassName,
  errorTitleColor,
  errorMessageColor,
  retryButtonStyle,

  // Empty
  emptyMessage = "No data found.",
  showEmpty,
  emptyClassName,
  emptyStyle,
  emptyRowClassName,
  emptyRowStyle,

  // Rows
  rowClassName,
  rowStyle,
  getRowClassName,
  getRowStyle,
  divided = false,
  divider,

  // Table chrome
  tableClassName = "w-full text-left",
  tableStyle,
  colgroup,
  theadRowClassName,
  theadRowStyle,
  scrollable = true,
  wrapperClassName = "overflow-x-auto",
  ariaLabel,
}) {
  const colCount = columns.length;
  const hasError = Boolean(isError || error);
  const useSkeleton = isLoading && skeletonRows > 0;
  const useLoadingMessage = isLoading && !useSkeleton && loadingMessage != null;
  const showErrorState = !isLoading && hasError;
  const emptyVisible =
    showEmpty !== undefined
      ? showEmpty
      : !isLoading && !hasError && data.length === 0 && emptyMessage != null;
  const showRows = !isLoading && !hasError && data.length > 0;

  const richError = Boolean(errorTitle || onRetry);

  function renderCell(column, row, rowIndex) {
    if (typeof column.render === "function") return column.render(row, rowIndex);
    if (column.accessor) return row?.[column.accessor] ?? null;
    return row?.[column.key] ?? null;
  }

  const table = (
    <table className={tableClassName} style={tableStyle} aria-label={ariaLabel}>
      {colgroup && colgroup.length > 0 && (
        <colgroup>
          {colgroup.map((col, i) => {
            if (col == null) return <col key={i} />;
            if (typeof col === "object") {
              return (
                <col key={i} style={col.width != null ? { width: col.width } : col} />
              );
            }
            return <col key={i} style={{ width: col }} />;
          })}
        </colgroup>
      )}

      <thead>
        <tr
          className={theadRowClassName}
          style={stripHeaderTextStyles(theadRowStyle)}
        >
          {columns.map((column) => (
            <th
              key={column.key}
              className={column.headerClassName}
              style={{ ...stripHeaderTextStyles(column.headerStyle), ...HEADER_TEXT }}
              scope="col"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {useSkeleton && (
          <SkeletonRows
            columns={columns}
            count={skeletonRows}
            rowClassName={skeletonRowClassName}
            rowStyle={skeletonRowStyle}
            divider={skeletonDivider ?? (divided ? divider || DEFAULT_DIVIDER : false)}
          />
        )}

        {useLoadingMessage && (
          <StateRow
            colCount={colCount}
            className={loadingClassName || emptyClassName || DEFAULT_STATE_CELL.className}
            style={loadingStyle || emptyStyle || DEFAULT_STATE_CELL.style}
          >
            {loadingMessage}
          </StateRow>
        )}

        {showErrorState && richError && (
          <StateRow
            colCount={colCount}
            className={errorCellClassName || DEFAULT_ERROR_RICH.cellClassName}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                {errorTitle && (
                  <p
                    className="text-sm font-semibold"
                    style={{ color: errorTitleColor || DEFAULT_ERROR_RICH.titleColor }}
                  >
                    {errorTitle}
                  </p>
                )}
                {error != null && error !== "" && (
                  <p
                    className={`text-sm ${errorTitle ? "mt-1" : ""}`}
                    style={{
                      color: errorMessageColor || DEFAULT_ERROR_RICH.messageColor,
                      ...(errorStyle || {}),
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-sm font-bold transition hover:brightness-110 disabled:opacity-60 shrink-0"
                  style={{
                    backgroundColor: DEFAULT_ERROR_RICH.buttonBg,
                    color: DEFAULT_ERROR_RICH.buttonColor,
                    ...retryButtonStyle,
                  }}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
                    aria-hidden
                  />
                  {isRetrying ? "Retrying…" : "Retry"}
                </button>
              )}
            </div>
          </StateRow>
        )}

        {showErrorState && !richError && (
          <StateRow
            colCount={colCount}
            className={errorClassName || DEFAULT_ERROR_SIMPLE.className}
            style={errorStyle || DEFAULT_ERROR_SIMPLE.style}
          >
            {error}
          </StateRow>
        )}

        {emptyVisible && (
          <tr className={emptyRowClassName} style={emptyRowStyle}>
            <td
              colSpan={colCount}
              className={emptyClassName || DEFAULT_STATE_CELL.className}
              style={emptyStyle || DEFAULT_STATE_CELL.style}
            >
              {emptyMessage}
            </td>
          </tr>
        )}

        {showRows &&
          data.map((row, rowIndex) => {
            const dividerStyle = buildDividerStyle(divided, divider, rowIndex, data.length);
            const customStyle = getRowStyle?.(row, rowIndex) ?? resolveStyle(rowStyle, row, rowIndex);
            const mergedStyle =
              dividerStyle || customStyle
                ? { ...dividerStyle, ...customStyle }
                : undefined;

            return (
              <tr
                key={getRowKey(row, rowIndex)}
                className={
                  getRowClassName?.(row, rowIndex) ??
                  resolveClassName(rowClassName, row, rowIndex)
                }
                style={mergedStyle}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.cellClassName}
                    style={resolveStyle(column.cellStyle, row, rowIndex)}
                  >
                    {renderCell(column, row, rowIndex)}
                  </td>
                ))}
              </tr>
            );
          })}
      </tbody>
    </table>
  );

  if (!scrollable) return table;
  return <div className={wrapperClassName}>{table}</div>;
}
