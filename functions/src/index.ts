/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

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

admin.initializeApp();
const firestore = admin.firestore();
const storage = new Storage();

setGlobalOptions({maxInstances: 10});

export const startInsightForge = onCall(async (request) => {
  try {
    const {url, pages, device, agentType} = request.data;
    logger.info(`Received startInsightForge request with agentType: ${agentType}`);

    if (!url || !pages || !device || !agentType) {
      logger.error("Missing required parameters.", { data: request.data });
      throw new HttpsError("invalid-argument", "Missing required parameters.");
    }

    const jobId = uuidv4();

    await firestore.collection("jobs").doc(jobId).set({
      status: "insight_forge_pending",
      url: url,
      createdAt: FieldValue.serverTimestamp(),
      agentType: agentType,
    });

    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL;
    if (!scraperServiceUrl) {
        logger.error("SCRAPER_SERVICE_URL environment variable not set.");
        // Attempt to construct a default emulator URL for local development
        const localScraperUrl = `http://127.0.0.1:8081/scrape`;
        logger.warn(`Trying to fall back to local scraper URL: ${localScraperUrl}`);
        axios.post(localScraperUrl, {
            url, pages, device, jobId,
        });
    } else {
         axios.post(scraperServiceUrl, {
            url, pages, device, jobId,
        });
    }


    return {jobId};
  } catch (error) {
    logger.error("Error starting Insight Forge job:", error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError("internal", "Internal Server Error");
  }
});

export const startAnalyticCore = onCall(async (request) => {
    try {
        const { jobId } = request.data;
        if (!jobId) {
            throw new HttpsError("invalid-argument", "Missing required parameter: jobId");
        }

        const jobDocRef = firestore.collection("jobs").doc(jobId);
        await jobDocRef.update({ status: "analytic_core_pending" });

        const jobDoc = await jobDocRef.get();
        if (!jobDoc.exists) {
            throw new HttpsError("not-found", "Job not found.");
        }

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
    const {jobId, modifiedMarkdown} = request.data;

    if (!modifiedMarkdown || !jobId) {
      throw new HttpsError("invalid-argument", "Missing required parameters: modifiedMarkdown, jobId");
    }
    
    const jobDocRef = firestore.collection("jobs").doc(jobId);

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
            ${htmlContent}
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
