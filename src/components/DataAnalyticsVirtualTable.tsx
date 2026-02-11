import { useEffect } from "react";
import { List } from "react-window";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type Props = {
  csvData: any[];
  headers: string[];
  matchKey: string;
  newRowMap: Map<string, boolean>;
  duplicateMap: Map<string, boolean>;
  updatedRowDiffMap: Map<string, Record<string, any>>;
  originalRowMap: Map<string, any>;
  height?: number;
  rowHeight?: number;
  columnWidth?: number;
  onReady?: () => void;
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null;
  onSort?: (key: string) => void;
};

const VirtualizedCsvTable = ({
  csvData,
  headers,
  matchKey,
  newRowMap,
  duplicateMap,
  updatedRowDiffMap,
  originalRowMap,
  height = 600,
  rowHeight = 30,
  columnWidth = 160,
  onReady,
  sortConfig,
  onSort
}: Props) => {

    useEffect(()=>{
        if (csvData.length > 0) {
            onReady?.();
        }
    },[csvData, onReady])

  const isCellUpdated = (row: any, field: string) => {
    const diff = updatedRowDiffMap.get(row[matchKey]);
    return diff ? field in diff : false;
  };


  const Header = () => (
    <div
    className="w-full flex sticky top-0 z-10 bg-muted/50 dark:bg-slate-900/90 border-b dark:border-slate-800 font-medium text-muted-foreground dark:text-slate-200 items-center backdrop-blur-sm"
      style={{
        display: "flex", 
        height: rowHeight, 
        minHeight: rowHeight,
      }}
    >
      {headers.map(h => {
        const isSorted = sortConfig?.key === h;
        const isAsc = sortConfig?.direction === 'asc';

        return (
        <div
        className={cn(
          "flex-1 px-4 text-left align-middle font-medium text-muted-foreground dark:text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis text-sm flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors select-none",
          isSorted && "text-foreground font-semibold"
        )}
          key={h}
          onClick={() => onSort?.(h)}
        >
          {h}
          {isSorted ? (
            isAsc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          )}
        </div>
        );
      })}
    </div>
  );

//  Row
  const Row = ({ index, style }: any) => {
    const row = csvData[index];
    const key = row[matchKey];
    const isNew = newRowMap.has(key);
    const isDuplicate = duplicateMap.has(key);


    return (
      <div
      className={cn(
        "w-full flex items-center border-b dark:border-slate-800 transition-colors hover:bg-muted/50 dark:hover:bg-slate-800/50 data-[state=selected]:bg-muted dark:text-slate-300",
         isNew && "bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-100",
         isDuplicate && "bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-100"
      )}
        style={{
          ...style,
          display: "flex",
        }}
        >
        {headers.map(field => {
          const updated = !isNew && isCellUpdated(row, field);
          const originalRow = originalRowMap.get(key);
          const previousValue = originalRow ? originalRow[field] : "N/A";
          
            return <div
            className={cn(
              "flex-1 px-4 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis flex items-center",
              updated && "bg-orange-200 dark:bg-orange-900/40 dark:text-orange-100 font-medium text-orange-900 gap-2"
            )}
            key={field}
            style={{
              width: columnWidth,
              height: "100%", 
            }}
            >
              {row[field]+ "  "}<span className="text-xs line-through opacity-70">  {updated && previousValue}</span>
            </div>;
          
         
        })}
      </div>
    );
  };

  return (
    <Card className="overflow-y-auto border-0 shadow-none dark:bg-slate-950" >
      <Header />

      <List
        rowCount={csvData.length}
        rowHeight={rowHeight}
        rowComponent={Row}
        rowProps={{}}
        style={{ height: height, width: "100%" }}
      />
    </Card>
  );
};

export default VirtualizedCsvTable;

