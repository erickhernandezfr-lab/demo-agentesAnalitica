'use server';

/**
 * @fileOverview This file defines a Genkit flow to export a tagging guide to a visually appealing PDF document with company branding.
 *
 * - exportTaggingGuideToPdf - A function that handles the export tagging guide to PDF process.
 * - ExportTaggingGuideToPdfInput - The input type for the exportTaggingGuideToPdf function.
 * - ExportTaggingGuideToPdfOutput - The return type for the exportTaggingGuideToPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExportTaggingGuideToPdfInputSchema = z.object({
  guideId: z.string().describe('The ID of the tagging guide to export.'),
});

export type ExportTaggingGuideToPdfInput = z.infer<
  typeof ExportTaggingGuideToPdfInputSchema
>;

const ExportTaggingGuideToPdfOutputSchema = z.object({
  pdfUrl: z.string().describe('The URL of the generated PDF file in Cloud Storage.'),
});

export type ExportTaggingGuideToPdfOutput = z.infer<
  typeof ExportTaggingGuideToPdfOutputSchema
>;

export async function exportTaggingGuideToPdf(
  input: ExportTaggingGuideToPdfInput
): Promise<ExportTaggingGuideToPdfOutput> {
  return exportTaggingGuideToPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exportTaggingGuideToPdfPrompt',
  input: {schema: ExportTaggingGuideToPdfInputSchema},
  output: {schema: ExportTaggingGuideToPdfOutputSchema},
  prompt: `You are an expert at generating visually appealing PDF documents from structured data.

  Your task is to take the tagging guide identified by guideId: {{{guideId}}} and export it to a PDF document.
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

const exportTaggingGuideToPdfFlow = ai.defineFlow(
  {
    name: 'exportTaggingGuideToPdfFlow',
    inputSchema: ExportTaggingGuideToPdfInputSchema,
    outputSchema: ExportTaggingGuideToPdfOutputSchema,
  },
  async input => {
    // Call PDF Generator Agent here
    const {output} = await prompt(input);
    return output!;
  }
);
