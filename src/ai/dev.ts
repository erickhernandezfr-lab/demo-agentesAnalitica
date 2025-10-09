import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tagging-guide.ts';
import '@/ai/flows/export-tagging-guide-to-pdf.ts';
import '@/ai/flows/generate-seo-recommendations.ts';