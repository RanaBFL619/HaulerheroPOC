import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Loader2 } from 'lucide-react';
import type { SheetData } from '@/services/api';

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as any[];
        
        // Store all rows for processing
        setAllRows(rows);
        
        // Create sheets structure - treating single CSV as multiple entity sheets
        // In a real scenario, you'd parse multiple sheets from Excel/XLSX format
        const sheetsData: SheetData[] = [
          {
            name: 'Account',
            headers: headers,
            rows: rows.slice(0, 10)
          },
          {
            name: 'Contact',
            headers: headers,
            rows: rows.slice(0, 10)
          },
          {
            name: 'Opportunity',
            headers: headers,
            rows: rows.slice(0, 10)
          }
        ];
        
        setSheets(sheetsData);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file');
      }
    });
  };

  const handleNext = async () => {
    if (sheets.length === 0) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    sessionStorage.setItem('sheets', JSON.stringify(sheets));
    sessionStorage.setItem('allRows', JSON.stringify(allRows));
    navigate('/field-mapping');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Upload Data
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and process your CSV files</p>
        </div>

        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 animate-in">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Upload CSV File</CardTitle>
                <CardDescription className="text-base mt-1">
                  Upload your CSV file to begin the data processing workflow
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose CSV File
              </Button>
              {file && (
                <span className="text-sm font-medium text-foreground bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm truncate max-w-full">
                  📄 {file.name}
                </span>
              )}
            </div>

            {sheets.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {sheets.map((sheet, index) => (
                    <div 
                      key={sheet.name} 
                      className="group p-5 border-2 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-400 dark:hover:border-blue-600"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {index + 1}
                          </span>
                          {sheet.name}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </span>
                          <span className="font-medium">{sheet.headers.length}</span> columns
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-5 w-5 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                          </span>
                          <span className="font-medium">{allRows.length}</span> rows
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* <div className="border-2 rounded-xl mt-6 overflow-hidden shadow-lg bg-white dark:bg-gray-900">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3">
                    <h3 className="font-semibold text-lg">Data Preview</h3>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <TableRow>
                          {sheets[0].headers.map((header, index) => (
                            <TableHead key={index} className="font-semibold text-foreground whitespace-nowrap">{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheets[0].rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex} className="hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                            {sheets[0].headers.map((header, colIndex) => (
                              <TableCell key={colIndex} className="whitespace-nowrap">{row[header]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div> */}

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleNext} 
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 h-11"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Next Step
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}