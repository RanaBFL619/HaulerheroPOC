import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    sessionStorage.clear();
    logout();
    navigate('/login');
  };

  // Don't render header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-sm ring-2 ring-primary/20">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
              Hauler Hero
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Data processing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="default"
            onClick={handleLogout}
            className="font-semibold"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
