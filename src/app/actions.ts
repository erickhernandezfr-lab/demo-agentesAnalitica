'use server';

import { z } from 'zod';
import { websiteScraping } from '@/ai/flows/website-scraping';

const analysisSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  pages: z.coerce.number().min(1).max(10),
  device: z.enum(['desktop', 'mobile']),
});

export async function startAnalysis(prevState: any, formData: FormData) {
  const validatedFields = analysisSchema.safeParse({
    url: formData.get('url'),
    pages: formData.get('pages'),
    device: formData.get('device'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { url, pages, device } = validatedFields.data;

  // Fire-and-forget the Genkit flow
  websiteScraping({
    startUrl: url,
    maxPages: pages,
    useMobile: device === 'mobile',
  }).catch(console.error);

  console.log(`Scraping process initiated for: ${url}`);

  return {
    message: `Analysis started for ${url}. Progress will be updated in the dashboard.`,
  };
}
