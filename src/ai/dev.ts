import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tagging-report.ts';
import '@/ai/flows/export-report-to-pdf.ts';
import '@/ai/flows/generate-seo-recommendations.ts';
import '@/ai/flows/website-scraping.ts';
