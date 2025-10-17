'use client';

import { useState } from 'react';
import { AgentGrid } from '@/components/dashboard/agent-grid';
import { AnalysisHistoryTable } from '@/components/dashboard/analysis-history-table';
import { Header } from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const router = useRouter();

  const handleJobStarted = (newJobId: string) => {
    setJobId(newJobId);
    router.push(`/dashboard/jobs/${newJobId}`);
  };

  return (
    <>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header setJobId={handleJobStarted} />
        <main className="flex-1 p-4 sm:px-6 sm:py-6 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <AgentGrid />
            <AnalysisHistoryTable />
          </div>
        </main>
      </div>
    </>
  );
}
