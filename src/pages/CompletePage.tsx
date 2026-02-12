import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, TrendingUp, PlusCircle, RefreshCw, MinusCircle, Copy, Calendar, Percent, Activity } from 'lucide-react';
import { loadImportStats, getDefaultImportStats, type ImportStats } from '@/types/importStats';
import { PAGE_OUTER, PAGE_CONTAINER } from '@/constants/layout';

function MetricCard({
  label,
  value,
  icon: Icon,
  subtext,
  className = '',
}: Readonly<{
  label: string;
  value: number | string;
  icon: React.ElementType;
  subtext?: string;
  className?: string;
}>) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 flex flex-col gap-1.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      {subtext != null && (
        <span className="text-xs text-muted-foreground">{subtext}</span>
      )}
    </div>
  );
}

function DonutChart({ stats }: Readonly<{ stats: ImportStats }>) {
  const { inserted, updated, unchanged, duplicatesInFile, totalRows } = stats;
  const total = totalRows || 1;
  const ins = (inserted / total) * 100;
  const upd = (updated / total) * 100;
  const unc = (unchanged / total) * 100;
  // conic-gradient: start from top, go clockwise (inserted, updated, unchanged, duplicates)
  const gradient = `conic-gradient(
    hsl(var(--primary)) 0% ${ins}%,
    hsl(45 100% 51%) ${ins}% ${ins + upd}%,
    hsl(var(--muted-foreground) / 0.4) ${ins + upd}% ${ins + upd + unc}%,
    hsl(var(--destructive) / 0.8) ${ins + upd + unc}% 100%
  )`;
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-foreground">Record breakdown</h4>
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-full flex-shrink-0 border-4 border-background shadow-inner"
          style={{ background: gradient }}
          aria-hidden
        />
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Inserted</span>
            <span className="font-medium tabular-nums">{inserted}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Updated</span>
            <span className="font-medium tabular-nums">{updated}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground">Unchanged</span>
            <span className="font-medium tabular-nums">{unchanged}</span>
          </div>
          {duplicatesInFile > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
              <span className="text-muted-foreground">Duplicates</span>
              <span className="font-medium tabular-nums">{duplicatesInFile}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarChart({ stats }: Readonly<{ stats: ImportStats }>) {
  const { inserted, updated, unchanged, duplicatesInFile, totalRows } = stats;
  const max = Math.max(totalRows, 1);
  const bars = [
    { label: 'Inserted', value: inserted, color: 'bg-primary' },
    { label: 'Updated', value: updated, color: 'bg-amber-500' },
    { label: 'Unchanged', value: unchanged, color: 'bg-muted-foreground/40' },
    ...(duplicatesInFile > 0 ? [{ label: 'Duplicates', value: duplicatesInFile, color: 'bg-destructive/80' as const }] : []),
  ];
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-foreground">By action</h4>
      <div className="space-y-2.5">
        {bars.map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-20 text-xs text-muted-foreground shrink-0">{label}</span>
            <div className="flex-1 h-6 rounded-md bg-muted/50 overflow-hidden">
              <div
                className={`h-full rounded-md ${color} transition-all duration-500`}
                style={{ width: `${(value / max) * 100}%`, minWidth: value > 0 ? '4px' : 0 }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums w-8 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Single stacked bar: full width, segments = inserted | updated | unchanged | duplicates */
function StackedBarChart({ stats }: Readonly<{ stats: ImportStats }>) {
  const { inserted, updated, unchanged, duplicatesInFile, totalRows } = stats;
  const total = totalRows || 1;
  const segments = [
    { label: 'Inserted', width: (inserted / total) * 100, color: 'bg-primary' },
    { label: 'Updated', width: (updated / total) * 100, color: 'bg-amber-500' },
    { label: 'Unchanged', width: (unchanged / total) * 100, color: 'bg-muted-foreground/40' },
    ...(duplicatesInFile > 0 ? [{ label: 'Duplicates', width: (duplicatesInFile / total) * 100, color: 'bg-destructive/80' as const }] : []),
  ].filter((s) => s.width > 0);
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-foreground">Outcome overview</h4>
      <div className="h-8 w-full flex rounded-lg overflow-hidden bg-muted/30 border border-border">
        {segments.map(({ label, width, color }) => (
          <div
            key={label}
            className={`${color} transition-all duration-500 min-w-0 flex-shrink-0 first:rounded-l-md last:rounded-r-md`}
            style={{ width: `${width}%` }}
            title={`${label}: ${Math.round(width)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map(({ label, width }) => (
          <span key={label}>
            <span className="font-medium text-foreground">{Math.round(width)}%</span> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CompletePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ImportStats | null>(null);

  useEffect(() => {
    setStats(loadImportStats());
  }, []);

  const handleStartOver = () => {
    sessionStorage.clear();
    navigate('/upload');
  };

  const s = stats ?? getDefaultImportStats();

  const hasStats = (s.totalRows > 0) || (s.inserted + s.updated + s.unchanged + s.duplicatesInFile > 0);

  const recordsAffected = s.inserted + s.updated;
  const totalForPct = s.totalRows || 1;
  const successRate = Math.round((recordsAffected / totalForPct) * 100);
  const pctInserted = Math.round((s.inserted / totalForPct) * 100);
  const pctUpdated = Math.round((s.updated / totalForPct) * 100);
  const pctUnchanged = Math.round((s.unchanged / totalForPct) * 100);
  const pctDuplicates = Math.round((s.duplicatesInFile / totalForPct) * 100);
  const importDate = s.timestamp
    ? new Date(s.timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className={PAGE_OUTER}>
      <div className={PAGE_CONTAINER}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Processing Complete</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your data has been successfully processed and loaded
          </p>
        </div>

        <Card className="shadow-lg border border-border bg-card animate-in overflow-hidden">
          <div className="h-2 bg-primary" />
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <CheckCircle2 className="h-16 w-16 text-primary animate-in" />
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-3xl md:text-4xl mb-2 text-foreground">
                  Success!
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  Import completed. Review the summary below.
                </CardDescription>
                {s.entity && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Entity: <span className="font-medium text-foreground">{s.entity}</span>
                  </p>
                )}
                {importDate && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {importDate}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            {hasStats && (
              <>
                {/* High-level summary */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    At a glance
                  </h3>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold tabular-nums">{s.totalRows}</span>
                    {" records processed: "}
                    <span className="font-semibold text-primary tabular-nums">{s.inserted} inserted</span>
                    {", "}
                    <span className="font-semibold text-amber-600 tabular-nums">{s.updated} updated</span>
                    {", "}
                    <span className="text-muted-foreground tabular-nums">{s.unchanged} unchanged</span>
                    {s.duplicatesInFile > 0 ? (
                      <>; <span className="font-medium text-destructive tabular-nums">{s.duplicatesInFile} duplicates</span> skipped.</>
                    ) : (
                      "."
                    )}
                  </p>
                </div>

                {/* Key metrics row */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                    Key metrics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <MetricCard
                      label="Total processed"
                      value={s.totalRows}
                      icon={TrendingUp}
                      subtext="records"
                    />
                    <MetricCard
                      label="Records affected"
                      value={recordsAffected}
                      icon={Activity}
                      subtext="inserted + updated"
                      className="border-primary/30"
                    />
                    <MetricCard
                      label="Success rate"
                      value={`${successRate}%`}
                      icon={Percent}
                      subtext="of total affected"
                    />
                    <MetricCard
                      label="Inserted"
                      value={s.inserted}
                      icon={PlusCircle}
                      subtext={totalForPct ? `${pctInserted}%` : "new"}
                    />
                    <MetricCard
                      label="Updated"
                      value={s.updated}
                      icon={RefreshCw}
                      subtext={totalForPct ? `${pctUpdated}%` : "modified"}
                    />
                    <MetricCard
                      label="Unchanged"
                      value={s.unchanged}
                      icon={MinusCircle}
                      subtext={totalForPct ? `${pctUnchanged}%` : "no change"}
                    />
                    <MetricCard
                      label="Duplicates"
                      value={s.duplicatesInFile}
                      icon={Copy}
                      subtext={totalForPct && s.duplicatesInFile > 0 ? `${pctDuplicates}%` : "in file"}
                    />
                  </div>
                </div>

                {/* Percentages breakdown */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Distribution</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                      <span className="text-muted-foreground">Inserted</span>
                      <span className="font-semibold tabular-nums ml-auto">{pctInserted}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-muted-foreground">Updated</span>
                      <span className="font-semibold tabular-nums ml-auto">{pctUpdated}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      <span className="text-muted-foreground">Unchanged</span>
                      <span className="font-semibold tabular-nums ml-auto">{pctUnchanged}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-destructive/80 shrink-0" />
                      <span className="text-muted-foreground">Duplicates</span>
                      <span className="font-semibold tabular-nums ml-auto">{pctDuplicates}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <DonutChart stats={s} />
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <BarChart stats={s} />
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4 md:col-span-2 lg:col-span-1">
                    <StackedBarChart stats={s} />
                  </div>
                </div>
              </>
            )}

            <div className="bg-muted/50 p-6 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">What happened</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="text-foreground">Your CSV was uploaded and parsed into <span className="font-medium tabular-nums">{s.totalRows || "—"}</span> records.</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="text-foreground">Source columns were mapped to the target entity; data was transformed accordingly.</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="text-foreground">
                    Each record was compared: <span className="font-medium text-primary">new</span> ones inserted, <span className="font-medium text-amber-600">existing</span> updated, unchanged kept, duplicates skipped.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="text-foreground">Data has been loaded into the system and is ready to use.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={handleStartOver} className="flex-1 h-12 text-base font-semibold">
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
