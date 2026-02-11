import { useEffect, useMemo } from "react";
// @ts-ignore
import { List } from "react-window";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

const DEFAULT_COLUMN_WIDTH = 180;

type Props = {
  csvData: any[];
  headers: string[];
  matchKey: string;
  newRowMap: Map<string, boolean>;
  updatedRowDiffMap: Map<string, Record<string, any>>;
  originalRowMap: Map<string, any>;
  height?: number;
  rowHeight?: number;
  columnWidth?: number;
  onReady?: () => void;
};

type RowPropsFromList = {
  index: number;
  style: React.CSSProperties;
  ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: string };
};

type RowPropsPassed = {
  csvData: any[];
  headers: string[];
  matchKey: string;
  newRowMap: Map<string, boolean>;
  updatedRowDiffMap: Map<string, Record<string, any>>;
  originalRowMap: Map<string, any>;
  columnWidth: number;
  totalRowWidth: number;
  rowHeight: number;
};

function TableRow({
  index,
  style,
  csvData,
  headers,
  matchKey,
  newRowMap,
  updatedRowDiffMap,
  originalRowMap,
  columnWidth,
  totalRowWidth,
  rowHeight,
}: Readonly<RowPropsFromList & RowPropsPassed>) {
  const row = csvData[index];
  if (!row) return null;

  const isNew = newRowMap.has(row[matchKey]);

  const isCellUpdated = (r: any, field: string) => {
    const diff = updatedRowDiffMap.get(r[matchKey]);
    return diff ? field in diff : false;
  };

  return (
    <div
      className={cn(
        "flex items-stretch border-b border-border transition-colors hover:bg-muted/50 text-foreground shrink-0",
        isNew && "bg-primary/10 hover:bg-primary/15"
      )}
      style={{
        ...style,
        width: totalRowWidth,
        minWidth: totalRowWidth,
        height: rowHeight,
        minHeight: rowHeight,
        display: "flex",
      }}
    >
      {headers.map((field) => {
        const updated = !isNew && isCellUpdated(row, field);
        const originalRow = originalRowMap.get(row[matchKey]);
        const previousValue = originalRow ? originalRow[field] : "N/A";
        const cellValue = row[field] != null ? String(row[field]) : "";

        return (
          <div
            className={cn(
              "px-3 py-2 text-sm flex items-center border-r border-border last:border-r-0 shrink-0 overflow-hidden",
              updated && "bg-destructive/10 text-destructive font-medium"
            )}
            key={field}
            style={{
              width: columnWidth,
              minWidth: columnWidth,
              height: "100%",
            }}
            title={cellValue}
          >
            <span className="truncate block" title={cellValue}>
              {cellValue}
              {updated && (
                <span className="text-xs line-through text-muted-foreground ml-1" title={String(previousValue)}>
                  {String(previousValue)}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const VirtualizedCsvTable = ({
  csvData,
  headers,
  matchKey,
  newRowMap,
  updatedRowDiffMap,
  originalRowMap,
  height = 600,
  rowHeight = 30,
  columnWidth: columnWidthProp,
  onReady,
}: Props) => {
  const columnWidth = columnWidthProp ?? DEFAULT_COLUMN_WIDTH;
  const totalRowWidth = headers.length * columnWidth;

  useEffect(() => {
    if (csvData.length > 0) {
      onReady?.();
    }
  }, [csvData.length, onReady]);

  const rowProps: RowPropsPassed = useMemo(
    () => ({
      csvData,
      headers,
      matchKey,
      newRowMap,
      updatedRowDiffMap,
      originalRowMap,
      columnWidth,
      totalRowWidth,
      rowHeight,
    }),
    [
      csvData,
      headers,
      matchKey,
      newRowMap,
      updatedRowDiffMap,
      originalRowMap,
      columnWidth,
      totalRowWidth,
      rowHeight,
    ]
  );

  const tableContentWidth = Math.max(totalRowWidth, 320);

  return (
    <Card className="overflow-hidden border border-border shadow-none bg-card flex flex-col">
      {/* Single horizontal scroll: only this wrapper scrolls horizontally. List handles vertical scroll only. */}
      <div className="overflow-x-auto overflow-y-hidden flex flex-col min-h-0" style={{ maxHeight: rowHeight + height }}>
        <div style={{ width: tableContentWidth, minWidth: "100%" }}>
          <div
            className="flex bg-muted border-b border-border font-medium text-muted-foreground items-center shrink-0"
            style={{
              height: rowHeight,
              minHeight: rowHeight,
              width: totalRowWidth,
              minWidth: totalRowWidth,
            }}
          >
            {headers.map((h) => (
              <div
                className="px-3 py-2 text-left text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis shrink-0 border-r border-border last:border-r-0"
                key={h}
                style={{
                  width: columnWidth,
                  minWidth: columnWidth,
                }}
                title={h}
              >
                {h}
              </div>
            ))}
          </div>

          <List
            rowCount={csvData.length}
            rowHeight={rowHeight}
            rowComponent={TableRow}
            rowProps={rowProps as any}
            style={{
              height: height,
              width: totalRowWidth,
              overflowX: "hidden",
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default VirtualizedCsvTable;
