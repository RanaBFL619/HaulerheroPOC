import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { diff } from "deep-object-diff";
import VirtualizedCsvTable from "@/components/DataAnalyticsVirtualTable";
import { api } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, Filter } from "lucide-react";
import { TableData } from "@/lib/TableData";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DuplicateResolveModal } from "@/components/DuplicateResolveModal";

const MATCH_KEY = "Email";

const DataAnalyticsPage = () => {
  const navigate = useNavigate();

  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [comparedRows, setComparedRows] = useState<any[]>([]);
  const [originalRowMap, setOriginalRowMap] = useState<Map<string, any>>(new Map());
  const [duplicateMap, setDuplicateMap] = useState<Map<string, boolean>>(new Map());
  const [duplicateGroups, setDuplicateGroups] = useState<Map<string, any[]>>(new Map());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  const [loading,setLoading] =  useState<Boolean>(true);
  const [tableReady,setTableReady] =  useState<Boolean>(false); 
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());

  const toggleColumn = (column: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(column)) {
      newVisible.delete(column);
    } else {
      newVisible.add(column);
    }
    setVisibleColumns(newVisible);
  }; 

const entityStr = sessionStorage.getItem("selectedEntity");
  const loadDbData = () => {
    const raw = sessionStorage.getItem("DB_DATA");
    return raw ? JSON.parse(raw) : [...TableData];
  };

  const indexByKey = (rows: any[], key: string) => {
    const map = new Map<string, any>();
    rows.forEach(row => {
      if (row[key] != null) {
        map.set(row[key], row);
      }
    });
    return map;
  };


  const compareCsvWithDb = (csvRows: any[], dbRows: any[]) => {
    const dbMap = indexByKey(dbRows, MATCH_KEY);
    const result: any[] = [];

    csvRows.forEach(csvRow => {
      const key = csvRow[MATCH_KEY];
      const dbRow = dbMap.get(key);

      if (!dbRow) {
        result.push({
          status: "NEW",
          csvRow
        });
        return;
      }

      const differences = diff(dbRow, csvRow);
      if (Object.keys(differences).length > 0) {
        result.push({
          status: "UPDATED",
          csvRow,
          diff: differences
        });
      }
    });

    return result;
  };

  const detectDuplicates = (rows: any[]) => {
    const groups = new Map<string, any[]>();
    
    // Single pass to group
    rows.forEach(row => {
      const key = row[MATCH_KEY];
      if (key) {
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(row);
      }
    });

    const duplicates = new Map<string, boolean>();
    const duplicateGroups = new Map<string, any[]>();

    // Filter groups with >1 item
    groups.forEach((group, key) => {
      if (group.length > 1) {
        duplicates.set(key, true);
        duplicateGroups.set(key, group);
      }
    });

    setDuplicateGroups(duplicateGroups);
    return duplicates;
  };


  useEffect(() => {
    console.log("Duplicates :",duplicateMap);
  }, [duplicateMap]);


  const loadAnalyticsData = async () => {
    const allRowsStr = sessionStorage.getItem("allRows");
    const allMappingsStr = sessionStorage.getItem("allEntityMappings");
    

    if (!allRowsStr || !allMappingsStr) {
      navigate("/upload");
      return;
    }

    const allRows = JSON.parse(allRowsStr);
    const allMappings = JSON.parse(allMappingsStr);
    const selectedEntity = entityStr || "Account";
    const entityMappings = allMappings[selectedEntity];

    const mappedResult = await api.processMappedData(
      entityMappings,
      allRows
    );

    const mappedCsv = mappedResult.data;
    setCsvData(mappedCsv);

    if (mappedCsv.length > 0) {
      const allHeaders = Object.keys(mappedCsv[0]);
      setHeaders(allHeaders);
      setVisibleColumns(new Set(allHeaders));
    }

    const dbRows = loadDbData();
    setOriginalRowMap(indexByKey(dbRows, MATCH_KEY));
    const compared = compareCsvWithDb(mappedCsv, dbRows);
    setComparedRows(compared);

    const duplicates = detectDuplicates(mappedCsv);
    setDuplicateMap(duplicates);

    setLoading(false);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleMerge = (originalRecords: any[], mergedRecord: any) => {
    // 1. Remove original records from csvData
    // We use a Set for O(1) lookups and to ensure reference matching works
    const recordsToRemove = new Set(originalRecords);
    const newCsvData = csvData.filter(row => !recordsToRemove.has(row));
    
    // 2. Add merged record
    // Mark as MERGED so it doesn't get flagged as new/dup again immediately (though detectDuplicates runs on all)
    // Actually, if we add it back, and it has the SAME email, it might trigger duplicate detection if there are OTHER rows with same email?
    // But we just removed all rows with that email (originalRecords).
    // So the new record is unique for that email.
    newCsvData.push(mergedRecord);

    setCsvData([...newCsvData]); 

    // 3. Update duplicate map/groups
    const key = mergedRecord[MATCH_KEY];
    const newGroups = new Map(duplicateGroups);
    newGroups.delete(key);
    setDuplicateGroups(newGroups);

    const newDupMap = new Map(duplicateMap);
    newDupMap.delete(key);
    setDuplicateMap(newDupMap);

    // 4. Update row statuses (optional, for green/red highlight)
    // mergedRecord might need to be checked against DB again.
    // For now, let's assume if it was a duplicate, it's treated as a "NEW" record if not in DB, 
    // or we can add a specific "MERGED" logic.
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const newRowMap = useMemo(() => {
    const map = new Map<string, boolean>();
    comparedRows.forEach(r => {
      if (r.status === "NEW") {
        map.set(r.csvRow[MATCH_KEY], true);
      }
    });
    return map;
  }, [comparedRows]);

  const updatedRowDiffMap = useMemo(() => {
    const map = new Map<string, any>();
    comparedRows.forEach(r => {
      if (r.status === "UPDATED") {
        map.set(r.csvRow[MATCH_KEY], r.diff);
      }
    });
    return map;
  }, [comparedRows]);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filteredData = useMemo(() => {
    if (filterStatus === "ALL") return csvData;

    return csvData.filter(row => {
      const isNew = newRowMap.has(row[MATCH_KEY]);
      const isUpdated = updatedRowDiffMap.has(row[MATCH_KEY]);
      const isDuplicate = duplicateMap.has(row[MATCH_KEY]);
      const isUnchanged = !isNew && !isUpdated;

      if (filterStatus === "NEW") return isNew;
      if (filterStatus === "UPDATED") return isUpdated;
      if (filterStatus === "DUPLICATE") return isDuplicate;
      if (filterStatus === "UNCHANGED") return isUnchanged;
      return true;
    });
  }, [csvData, filterStatus, newRowMap, updatedRowDiffMap, duplicateMap]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }
const showLoader = loading || !tableReady

  return (
<>
    {showLoader &&  <><div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
        </div>
      </div> </>
    }
    {  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Data Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">View the Data as per the changes</p>
        </div>
        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 animate-in">
        <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl">Entity Changes Preview</CardTitle>
            <CardDescription className="text-base mt-1">
              The Selected Entity : {entityStr} will have the following changes.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex-1 sm:flex-none h-10 px-4 py-2 rounded-lg border-2 border-input bg-white dark:bg-gray-900 text-foreground dark:text-blue-300 hover:border-blue-500 dark:hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-medium shadow-sm hover:bg-white">
                  <Filter className="mr-2 h-4 w-4" /> Filter <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-2 border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 text-foreground dark:text-blue-300">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filterStatus} onValueChange={setFilterStatus}>
                  <DropdownMenuRadioItem value="ALL">All Records</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="NEW">Created</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="UPDATED">Modified</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="DUPLICATE">Duplicates</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="UNCHANGED">Unchanged</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex-1 sm:flex-none h-10 px-4 py-2 rounded-lg border-2 border-input bg-white dark:bg-gray-900 text-foreground dark:text-blue-300 hover:border-blue-500 dark:hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-medium shadow-sm hover:bg-white ">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-2 border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-900 text-foreground dark:text-blue-300">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {headers.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    className="capitalize"
                    checked={visibleColumns.has(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {duplicateGroups.size > 0 && (
              <Button 
                onClick={() => setIsMergeModalOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Resolve Duplicates ({duplicateGroups.size})
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
            <div className=" flex flex-col gap-3">
      <VirtualizedCsvTable
      onReady={()=>{setTableReady(true)}}
        csvData={sortedData}
        headers={headers.filter(h => visibleColumns.has(h))}
        matchKey={MATCH_KEY}
        newRowMap={newRowMap}
        updatedRowDiffMap={updatedRowDiffMap}
        duplicateMap={duplicateMap}
        originalRowMap={originalRowMap}
        height={400}
        sortConfig={sortConfig}
        onSort={handleSort}
        />  
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/data-preview')}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <Button 

                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 h-11 order-1 sm:order-2"
              onClick={()=>{navigate('/complete')}}
              >
                Process Data
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
    <DuplicateResolveModal 
      isOpen={isMergeModalOpen}
      onClose={() => setIsMergeModalOpen(false)}
      duplicateGroups={duplicateGroups}
      onMerge={handleMerge}
    />
    </div>}
    </>
  );
};

export default DataAnalyticsPage;