'use server';

/**
 * @fileOverview This file defines a Genkit flow to trigger the PDF generation for a report.
 *
 * - createPdfReport - A function that handles triggering the PDF report generation.
 * - CreatePdfReportInput - The input type for the createPdfReport function.
 * - CreatePdfReportOutput - The return type for the createPdfReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreatePdfReportInputSchema = z.object({
  jobId: z.string().describe('The ID of the job for which to generate a PDF.'),
  markdownContent: z.string().describe('The Markdown content of the report to be converted to PDF.'),
});

export type CreatePdfReportInput = z.infer<typeof CreatePdfReportInputSchema>;

const CreatePdfReportOutputSchema = z.object({
  pdfUrl: z.string().describe('The URL of the generated PDF file in Cloud Storage.'),
});

export type CreatePdfReportOutput = z.infer<typeof CreatePdfReportOutputSchema>;

export async function createPdfReport(
  input: CreatePdfReportInput
): Promise<CreatePdfReportOutput> {
  return createPdfReportFlow(input);
}

const createPdfReportFlow = ai.defineFlow(
  {
    name: 'createPdfReportFlow',
    inputSchema: CreatePdfReportInputSchema,
    outputSchema: CreatePdfReportOutputSchema,
  },
  async ({jobId, markdownContent}) => {
    // In a real implementation, you would call the `generatePdf` Cloud Function here.
    // This is a placeholder to demonstrate the flow structure.
    console.log(`Triggering PDF generation for job: ${jobId}`);
    
    // Example of calling the function (this would need proper auth and URL handling)
    // const response = await fetch(process.env.GENERATE_PDF_FUNCTION_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ jobId, markdownContent }),
    // });
    // if (!response.ok) {
    //   throw new Error('PDF generation failed');
    // }
    // const result = await response.json();
    // return { pdfUrl: result.pdfUrl };

    // Placeholder response:
    await new Promise(resolve => setTimeout(resolve, 3000));
    const fakePdfUrl = `https://storage.googleapis.com/your-bucket/reports/${jobId}.pdf`;
    console.log(`PDF for job ${jobId} would be at ${fakePdfUrl}`);
    
    return {
      pdfUrl: fakePdfUrl,
    };
  }
);
