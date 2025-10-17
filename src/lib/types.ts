export type AnalysisStatus =
  | 'pending'
  | 'in_progress'
  | 'scraping_completed'
  | 'analysis_completed'
  | 'report_completed'
  | 'generating_pdf'
  | 'completed'
  | 'failed'
  | 'not_started';

export type Analysis = {
  id: string;
  url: string;
  createdAt: string;
  completedAt: string | null;
  status: AnalysisStatus; // Overall status
  scrappingStatus: AnalysisStatus;
  analysisStatus: AnalysisStatus;
  reportStatus: AnalysisStatus;
  pdfStatus: AnalysisStatus;
  recommendations: string[];
  screenshots: string[]; // array of image placeholder IDs
  reportPdfUrl: string | null;
};

// Interface for the Firestore 'jobs' collection document
export interface Job {
  jobId: string;
  agentType: string;
  url: string;
  status: AnalysisStatus;
  createdAt: any; // Firestore Timestamp
  pdfUrl?: string;
  error?: string;
}
