# Analytics Agent - Implementation Guide

This document serves as the canonical reference for the structure, terminology, and patterns used within the Analytics Agent application. All AI-generated outputs, especially reports and data structures, should adhere to these guidelines.

## 1. Report Structure

All generated reports, whether in Markdown or being prepared for PDF export, must follow this hierarchical structure.

### 1.1. Overview
A brief, high-level summary of the analysis. Mention the target URL, the date of analysis, and a one-sentence conclusion.

### 1.2. Recommended Events
A list of recommended analytics events based on the components identified during the scrape. Each event should have a clear, user-friendly name.

### 1.3. DataLayer Structure
A proposed `dataLayer` variable structure in JSON format. This should define the schema for the events and the variables that will be pushed.

### 1.4. Suggested GA4 Mappings
Guidance on how to map the proposed `dataLayer` events and variables to Google Analytics 4 (GA4) events and parameters.

### 1.5. Tagging Consistency Summary
An analysis of the existing tagging structure (if any) and a summary of its consistency, highlighting any issues found.

## 2. Terminology

- **Job**: Refers to the entire end-to-end process, from the user's initial request to the final PDF generation. Identified by a `jobId`.
- **Analysis**: Refers specifically to the step where AI models process the scraped data.
- **Report**: The final user-facing document, generated in Markdown and then converted to PDF.
- **Component**: A distinct, visually and semantically separate part of a webpage (e.g., "main_hero", "product_grid").

## 3. Data Models

### 3.1. Firestore Job Document (`/jobs/{jobId}`)

```json
{
  "jobId": "string",
  "agentType": "string",
  "url": "string",
  "status": "pending | scraping_completed | analysis_completed | report_completed | generating_pdf | completed | failed",
  "createdAt": "Timestamp",
  "pdfUrl": "string | null",
  "error": "string | null"
}
```
