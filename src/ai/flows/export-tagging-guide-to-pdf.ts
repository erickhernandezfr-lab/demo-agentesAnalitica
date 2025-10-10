'use server';

/**
 * @fileOverview This file defines a Genkit flow to export a report to a visually appealing PDF document with company branding.
 *
 * - exportReportToPdf - A function that handles the export report to PDF process.
 * - ExportReportToPdfInput - The input type for the exportReportToPdf function.
 * - ExportReportToPdfOutput - The return type for the exportReportToPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExportReportToPdfInputSchema = z.object({
  reportId: z.string().describe('The ID of the report to export.'),
});

export type ExportReportToPdfInput = z.infer<
  typeof ExportReportToPdfInputSchema
>;

const ExportReportToPdfOutputSchema = z.object({
  pdfUrl: z.string().describe('The URL of the generated PDF file in Cloud Storage.'),
});

export type ExportReportToPdfOutput = z.infer<
  typeof ExportReportToPdfOutputSchema
>;

export async function exportReportToPdf(
  input: ExportReportToPdfInput
): Promise<ExportReportToPdfOutput> {
  return exportReportToPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exportReportToPdfPrompt',
  input: {schema: ExportReportToPdfInputSchema},
  output: {schema: ExportReportToPdfOutputSchema},
  prompt: `You are an expert at generating visually appealing PDF documents from structured data.

  Your task is to take the tagging report identified by reportId: {{{reportId}}} and export it to a PDF document.
  The PDF should include company branding (logo, colors), clear sections, and a professional layout.
  The PDF will be stored in Google Cloud Storage.
  Return the URL of the PDF in the "pdfUrl" field.
  Ensure the PDF is well-formatted and easy to read.
  Make use of headers, bullet points, and other formatting elements.
  Focus on the visual appeal and clarity of the content.
  Consider using HTML-like structured output to facilitate the PDF conversion process.
  Make it suitable for sharing and implementation by users.
  Make sure to include these UI guidelines:
  - Primary color: Deep purple (#6750A4) to evoke a sense of intelligence, authority, and careful deliberation.
  - Background color: Very light purple (#F2F0F7) to provide a clean and neutral backdrop that complements the primary color.
  - Accent color: Teal (#008080) to add a touch of sophistication and modernity, while providing visual contrast.
  - Body and headline font: 'Inter' sans-serif for a modern, neutral, and readable look.
  - Code font: 'Source Code Pro' for clear presentation of code snippets or technical details.
  - Use a consistent style of minimalist icons to represent different components, analysis types, and recommendations.
  - Employ a clean, grid-based layout for the document to ensure information is well-organized and easily accessible.
  `,
});

const exportReportToPdfFlow = ai.defineFlow(
  {
    name: 'exportReportToPdfFlow',
    inputSchema: ExportReportToPdfInputSchema,
    outputSchema: ExportReportToPdfOutputSchema,
  },
  async input => {
    // Call PDF Generator Agent here
    const {output} = await prompt(input);
    return output!;
  }
);
