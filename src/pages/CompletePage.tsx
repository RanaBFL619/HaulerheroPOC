import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function CompletePage() {
  const navigate = useNavigate();

  const handleStartOver = () => {
    // Clear session storage
    sessionStorage.clear();
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Processing Complete</h1>
          <p className="text-sm text-muted-foreground mt-1">Your data has been successfully processed</p>
        </div>

        <Card className="shadow-xl border-0 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 animate-in overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl shadow-lg">
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 animate-in" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-3xl md:text-4xl mb-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Success!
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  Your data has been successfully processed and loaded
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-xl border-2 border-green-200 dark:border-green-800 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">What happened:</h3>
              </div>
              <ul className="space-y-3 ml-10">
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">CSV file uploaded and parsed</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">Fields automatically mapped</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">Data transformed according to mappings</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">Data successfully loaded into the system</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={handleStartOver} 
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Process Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
