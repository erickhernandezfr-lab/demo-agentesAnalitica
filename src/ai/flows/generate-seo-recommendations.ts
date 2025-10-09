'use server';

/**
 * @fileOverview Generates SEO recommendations for a given website based on its scraped data.
 *
 * - generateSeoRecommendations - A function that generates SEO recommendations.
 * - GenerateSeoRecommendationsInput - The input type for the generateSeoRecommendations function.
 * - GenerateSeoRecommendationsOutput - The return type for the generateSeoRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoRecommendationsInputSchema = z.object({
  scrapedData: z.string().describe('The scraped data of the website in JSON format.'),
});

export type GenerateSeoRecommendationsInput = z.infer<
  typeof GenerateSeoRecommendationsInputSchema
>;

const GenerateSeoRecommendationsOutputSchema = z.object({
  seo_score: z.number().describe('The SEO score of the website (0-100).'),
  recommendations: z.array(
    z.string().describe('A list of specific SEO improvements.')
  ),
});

export type GenerateSeoRecommendationsOutput = z.infer<
  typeof GenerateSeoRecommendationsOutputSchema
>;

export async function generateSeoRecommendations(
  input: GenerateSeoRecommendationsInput
): Promise<GenerateSeoRecommendationsOutput> {
  return generateSeoRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoRecommendationsPrompt',
  input: {schema: GenerateSeoRecommendationsInputSchema},
  output: {schema: GenerateSeoRecommendationsOutputSchema},
  prompt: `You are an SEO expert analyzing a website's scraped data to provide recommendations for improvement.

  Analyze the following scraped data and provide an SEO score (0-100) and a list of specific recommendations to improve the website's search engine ranking.

  Scraped Data:
  {{scrapedData}}

  Ensure the recommendations are actionable and specific.
  Provide the response as JSON in the following format: {seo_score: number, recommendations: string[]}

  Consider the following aspects during the analysis:
  - Tagging consistency
  - Semantic structure
  - Accessibility
  - GA4 parameter usage
  - dataLayer structure
`,
});

const generateSeoRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateSeoRecommendationsFlow',
    inputSchema: GenerateSeoRecommendationsInputSchema,
    outputSchema: GenerateSeoRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
