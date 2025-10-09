import { AnalysisHistoryTable } from '@/components/dashboard/analysis-history-table';
import { NewAnalysisDialog } from '@/components/dashboard/new-analysis-dialog';
import { analyses } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <NewAnalysisDialog />
      </div>
      <div className="w-full">
        <AnalysisHistoryTable analyses={analyses} />
      </div>
    </div>
  );
}
