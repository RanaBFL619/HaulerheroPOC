import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Upload Data</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and process your CSV files</p>
        </div>

        <Card className="shadow-lg border border-border bg-card animate-in">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Upload className="h-6 w-6 text-primary-foreground" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-muted/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto font-semibold"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose CSV File
              </Button>
              {file && (
                <span className="text-sm font-medium text-foreground bg-muted px-4 py-2 rounded-lg border border-border truncate max-w-full">
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
                      className="group p-5 border border-border rounded-xl bg-card hover:shadow-md transition-all hover:border-primary/40"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                          <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                            {index + 1}
                          </span>
                          {sheet.name}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </span>
                          <span className="font-medium">{sheet.headers.length}</span> columns
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="px-8 h-11 font-semibold"
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