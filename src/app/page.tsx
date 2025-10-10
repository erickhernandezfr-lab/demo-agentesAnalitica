import { AgentGrid } from '@/components/dashboard/agent-grid';
import { NewAnalysisDialog } from '@/components/dashboard/new-analysis-dialog';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard MCP Hub
        </h1>
        <NewAnalysisDialog />
      </div>
      <div className="w-full">
        <AgentGrid />
      </div>
    </div>
  );
}
