
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {setGlobalOptions} from "firebase-functions";
import {v4 as uuidv4} from "uuid";
import {FieldValue} from "@google-cloud/firestore";
import axios from "axios";
import puppeteer from "puppeteer";
import {Storage} from "@google-cloud/storage";
import {marked} from "marked";
import { generateTaggingReport } from "../../src/ai/flows/generate-tagging-report";
import * as admin from "firebase-admin";
import DOMPurify from 'dompurify';

admin.initializeApp();
const firestore = admin.firestore();
const storage = new Storage();

setGlobalOptions({maxInstances: 10});

// Helper to check for authenticated user
const ensureAuthenticated = (context: any) => {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
};


export const startInsightForge = onCall(async (request) => {
  try {
    ensureAuthenticated(request);
    const {url, pages, device, agentType} = request.data;
    logger.info(`Received startInsightForge request with agentType: ${agentType}`);

    if (!url || !pages || !device || !agentType) {
      logger.error("Missing required parameters.", { data: request.data });
      throw new HttpsError("invalid-argument", "Missing required parameters.");
    }
    
    const parsedPages = parseInt(pages, 10);
    if (isNaN(parsedPages) || parsedPages <= 0 || parsedPages > 20) { // Limit pages to 20
      throw new HttpsError('invalid-argument', '"pages" must be a number between 1 and 20.');
    }

    const jobId = uuidv4();
    const userId = request.auth.uid;

    await firestore.collection("jobs").doc(jobId).set({
      status: "insight_forge_pending",
      url: url,
      createdAt: FieldValue.serverTimestamp(),
      agentType: agentType,
      userId: userId, // Store the user ID
    });
    
    const isProduction = process.env.NODE_ENV === 'production';
    let scraperServiceUrl = process.env.SCRAPER_SERVICE_URL; // For local override

    if (isProduction && !scraperServiceUrl) {
        // In production, dynamically get the URL of the deployed scraper-service
        const {GoogleAuth} = require('google-auth-library');
        const auth = new GoogleAuth();
        const client = await auth.getIdTokenClient('https://scraper-service-upr76m4xma-uc.a.run.app'); // Audience must be the URL of the deployed service
        const res = await client.request({url: 'https://scraper-service-upr76m4xma-uc.a.run.app/scrape'});
        
        // This is a placeholder as we don't need to call it again, just get the URL.
        // We will call with axios with the token.
        scraperServiceUrl = 'https://scraper-service-upr76m4xma-uc.a.run.app/scrape'; 
        
        logger.info(`Authenticating with identity token for ${scraperServiceUrl}.`);
        const idToken = await client.getRequestHeaders(scraperServiceUrl);

        axios.post(scraperServiceUrl, {
            url, pages, device, jobId,
        }, {
            headers: idToken
        });
    } else {
        // Use local emulator URL or explicitly set URL
        if (!scraperServiceUrl) {
            scraperServiceUrl = `http://127.0.0.1:8081/scrape`;
            logger.warn(`SCRAPER_SERVICE_URL not set, falling back to local emulator: ${scraperServiceUrl}`);
        }
        axios.post(scraperServiceUrl, {
            url, pages, device, jobId,
        });
    }

    return {jobId};
  } catch (error: any) {
    logger.error("Error starting Insight Forge job:", error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError("internal", error.message || "Internal Server Error");
  }
});

export const startAnalyticCore = onCall(async (request) => {
    try {
        ensureAuthenticated(request);
        const { jobId } = request.data;
        if (!jobId) {
            throw new HttpsError("invalid-argument", "Missing required parameter: jobId");
        }

        const jobDocRef = firestore.collection("jobs").doc(jobId);
        const jobDoc = await jobDocRef.get();

        if (!jobDoc.exists || jobDoc.data()?.userId !== request.auth.uid) {
          throw new HttpsError('permission-denied', 'You do not have permission to access this job.');
        }

        await jobDocRef.update({ status: "analytic_core_pending" });

        const jobData = jobDoc.data();
        const jsonPath = jobData?.insightForgeOutput?.jsonPath;

        if (!jsonPath) {
            await jobDocRef.update({ status: "failed", error: "Scraping output (jsonPath) not found." });
            throw new HttpsError("failed-precondition", "Scraping output not found for this job.");
        }
        
        // This part needs a real implementation to fetch GCS content. Placeholder for now.
        // const scrapJsonContent = await readGcsFile(jsonPath); 
        const scrapJsonContent = { placeholder: `Data from ${jsonPath}` }; 


        const reportOutput = await generateTaggingReport({
            seoReport: { placeholder: "SEO report would be generated here" },
            scrapJson: scrapJsonContent,
        });

        await jobDocRef.update({
            status: "analytic_core_completed",
            analyticCoreDraft: reportOutput.report,
        });

        return { message: "Analytic Core completed successfully." };

    } catch (error) {
        const { jobId } = request.data;
        logger.error(`Error in startAnalyticCore for job ${jobId}:`, error);
        if (jobId && !(error instanceof HttpsError)) {
             try {
                await firestore.collection("jobs").doc(jobId).update({
                    status: "failed",
                    error: "Analytic Core process failed.",
                });
            } catch (firestoreError) {
                logger.error(`Failed to update Firestore for job ${jobId} after Analytic Core error:`, firestoreError);
            }
        }
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Internal Server Error");
    }
});


export const startTagOpsHub = onCall(async (request) => {
    ensureAuthenticated(request);
    const {jobId, modifiedMarkdown} = request.data;

    if (!modifiedMarkdown || !jobId) {
      throw new HttpsError("invalid-argument", "Missing required parameters: modifiedMarkdown, jobId");
    }
    
    const jobDocRef = firestore.collection("jobs").doc(jobId);
    const jobDoc = await jobDocRef.get();
    
    if (!jobDoc.exists || jobDoc.data()?.userId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'You do not have permission to access this job.');
    }

    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName) {
      logger.error("GCS_BUCKET environment variable not set.");
      throw new HttpsError("internal", "Server configuration error.");
    }

    const bucket = storage.bucket(bucketName);
    const fileName = `reports/${jobId}.pdf`;
    const file = bucket.file(fileName);

    try {
      await jobDocRef.update({status: "tagops_hub_pending"});

      const browser = await puppeteer.launch({args: ["--no-sandbox"]});
      const page = await browser.newPage();

      const htmlContent = marked(modifiedMarkdown);
      const sanitizedHtml = DOMPurify.sanitize(htmlContent);

      const finalHtml = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 2rem; }
              h1, h2, h3 { color: #333; }
              code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
              pre { background-color: #f4f4f4; padding: 1rem; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            ${sanitizedHtml}
          </body>
        </html>
      `;

      await page.setContent(finalHtml, {waitUntil: "networkidle0"});
      const pdfBuffer = await page.pdf({format: "A4", printBackground: true});

      await browser.close();

      await file.save(pdfBuffer, {
        metadata: {
          contentType: "application/pdf",
        },
      });

      const pdfUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      
      const tagOpsHubOutput = { pdfUrl: pdfUrl };

      await jobDocRef.update({
        status: "tagops_hub_completed",
        tagOpsHubOutput: tagOpsHubOutput,
      });

      return {pdfUrl};
    } catch (error) {
      logger.error(`Error in TagOps Hub (PDF Generation) for job ${jobId}:`, error);
      try {
        await jobDocRef.update({
          status: "failed",
          error: "PDF generation failed.",
        });
      } catch (firestoreError) {
        logger.error(`Failed to update Firestore for job ${jobId} after PDF error:`, firestoreError);
      }
      throw new HttpsError("internal", "Failed to generate PDF.");
    }
});

