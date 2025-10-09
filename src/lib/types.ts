export type AnalysisStatus =
  | 'pending'
  | 'in_progress'
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
  guideStatus: AnalysisStatus;
  pdfStatus: AnalysisStatus;
  seoScore: number | null;
  recommendations: string[];
  screenshots: string[]; // array of image placeholder IDs
  guidePdfUrl: string | null;
};
