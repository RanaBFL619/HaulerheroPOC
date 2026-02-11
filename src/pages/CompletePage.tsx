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
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Processing Complete</h1>
          <p className="text-sm text-muted-foreground mt-1">Your data has been successfully processed</p>
        </div>

        <Card className="shadow-lg border border-border bg-card animate-in overflow-hidden">
          <div className="h-2 bg-primary"></div>
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="relative p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <CheckCircle2 className="h-16 w-16 text-primary animate-in" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-3xl md:text-4xl mb-2 text-foreground">
                  Success!
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  Your data has been successfully processed and loaded
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <div className="bg-muted/50 p-6 rounded-xl border border-border space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-foreground">What happened:</h3>
              </div>
              <ul className="space-y-3 ml-10">
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">CSV file uploaded and parsed</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">Fields automatically mapped</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-foreground">Data transformed according to mappings</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="flex-1 h-12 text-base font-semibold"
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
