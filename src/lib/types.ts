export type Analysis = {
  id: string;
  url: string;
  createdAt: string;
  completedAt: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  seoScore: number | null;
  recommendations: string[];
  screenshots: string[]; // array of image placeholder IDs
  guidePdfUrl: string | null;
};
