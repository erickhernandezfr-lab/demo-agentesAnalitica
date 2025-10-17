'use client';

import { useState } from 'react';
import { AgentGrid } from '@/components/dashboard/agent-grid';
import { AnalysisHistoryTable } from '@/components/dashboard/analysis-history-table';
import { McpToolCard } from '@/components/dashboard/mcp-tool-card';
import { Header } from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';
import JobProgress from '@/components/dashboard/job-progress';

const analyses = [
  {
    id: '1',
    url: 'https://example.com',
    createdAt: '2023-10-27',
    status: 'Completed',
    scrappingStatus: 'completed',
    analysisStatus: 'completed',
    reportStatus: 'completed',
    pdfStatus: 'completed',
    reportPdfUrl: 'https://example.com/report.pdf',
    screenshots: [],

  },
  {
    id: '2',
    url: 'https://test-site.com',
    createdAt: '2023-10-28',
    status: 'In Progress',
    scrappingStatus: 'in_progress',
    analysisStatus: 'pending',
    reportStatus: 'not_started',
    pdfStatus: 'not_started',
    reportPdfUrl: null,
    screenshots: [],
  },
];

export default function DashboardPage() {
  const [jobId, setJobId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header setJobId={setJobId} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {jobId && <JobProgress jobId={jobId} />}
            <AgentGrid />
            <AnalysisHistoryTable analyses={analyses} />
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
            <McpToolCard />
          </div>
        </main>
      </div>
    </div>
  );
}
