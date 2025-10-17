'use client';

import { useState } from 'react';
import { AgentGrid } from '@/components/dashboard/agent-grid';
import { AnalysisHistoryTable } from '@/components/dashboard/analysis-history-table';
import { McpToolCard } from '@/components/dashboard/mcp-tool-card';
import { Header } from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';
import JobProgress from '@/components/dashboard/job-progress';
import { useRouter } from 'next/navigation';


export default function DashboardPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const router = useRouter();

  const handleJobStarted = (newJobId: string) => {
    setJobId(newJobId);
    router.push(`/dashboard/jobs/${newJobId}`);
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header setJobId={handleJobStarted} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <AgentGrid />
            <AnalysisHistoryTable />
          </div>
        </main>
      </div>
    </div>
  );
}
