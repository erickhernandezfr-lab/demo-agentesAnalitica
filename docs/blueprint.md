# **App Name**: SeoPilot

## Core Features:

- Website Scraping: Scrape a given URL using Playwright to extract HTML structure, component information, and screenshots, then store the scraped data and screenshots in Cloud Storage.
- SEO Analysis: Analyze the scraped website data with Gemini to identify tagging inconsistencies, accessibility issues, and areas for SEO improvement; generate an SEO score and specific recommendations.
- Tagging Guide Generation: Create a structured tagging guide in Markdown format, including an overview, recommended events, dataLayer structure, suggested GA4 mappings, and a tagging consistency summary. Convert this guide into a ready-to-export format.
- PDF Export: Convert the generated tagging guide into a visually appealing PDF format, incorporating a company logo and appropriate styling, and store it in Cloud Storage.
- Dashboard Integration: Provide data formatted for easy integration into a Next.js or Firebase Hosting dashboard, allowing users to view scraping history, preview screenshots, trigger SEO analysis or PDF generation, and display tagging guide summaries.
- Data Storage: Store website scraping data, SEO reports, and tagging guides in Firestore, and file-based assets like images and PDF files in Cloud Storage. The firestore DB uses collections named 'scrappings', 'seoReports', and 'taggingGuides'.
- Triggering SEO analysis and guide generation: Firebase Callable functions which will be used for triggering website scraping, analysis and PDF guide generation on demand from the UI

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to evoke a sense of intelligence, authority, and careful deliberation.
- Background color: Very light purple (#F2F0F7) to provide a clean and neutral backdrop that complements the primary color.
- Accent color: Teal (#008080) to add a touch of sophistication and modernity, while providing visual contrast.
- Body and headline font: 'Inter' sans-serif for a modern, neutral, and readable look.
- Code font: 'Source Code Pro' for clear presentation of code snippets or technical details.
- Use a consistent style of minimalist icons to represent different components, analysis types, and recommendations.
- Employ a clean, grid-based layout for the dashboard to ensure information is well-organized and easily accessible.