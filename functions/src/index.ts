/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {setGlobalOptions} from "firebase-functions";
import {v4 as uuidv4} from "uuid";
import {Firestore, FieldValue} from "@google-cloud/firestore";
import axios from "axios";
import cors from "cors";
import puppeteer from "puppeteer";
import {Storage} from "@google-cloud/storage";
import {marked} from "marked";
import { generateTaggingReport } from "../../src/ai/flows/generate-tagging-report";
import * as admin from "firebase-admin";

const corsHandler = cors({origin: true});

admin.initializeApp();
const firestore = admin.firestore();
const storage = new Storage();


setGlobalOptions({maxInstances: 10});

export const startInsightForge = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    try {
      const {url, pages, device, agentType} = request.body;

      if (!url || !pages || !device || !agentType) {
        response.status(400).send("Missing required parameters.");
        return;
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
        response.status(500).send("Server configuration error.");
        return;
      }


      // Do not await this call
      axios.post(scraperServiceUrl, {
        url,
        pages,
        device,
        jobId,
      });

      response.status(200).send({jobId});
    } catch (error) {
      logger.error("Error starting Insight Forge job:", error);
      response.status(500).send("Internal Server Error");
    }
  });
});

export const startAnalyticCore = onRequest(async (request, response) => {
    corsHandler(request, response, async () => {
        try {
            const { jobId } = request.body;
            if (!jobId) {
                response.status(400).send("Missing required parameter: jobId");
                return;
            }

            const jobDocRef = firestore.collection("jobs").doc(jobId);
            await jobDocRef.update({ status: "analytic_core_pending" });

            const jobDoc = await jobDocRef.get();
            if (!jobDoc.exists) {
                response.status(404).send("Job not found.");
                return;
            }

            const jobData = jobDoc.data();
            const jsonPath = jobData?.insightForgeOutput?.jsonPath;

            if (!jsonPath) {
                await jobDocRef.update({ status: "failed", error: "Scraping output (jsonPath) not found." });
                response.status(400).send("Scraping output not found for this job.");
                return;
            }

            // In a real implementation, you would download the content from GCS.
            // For now, we pass a placeholder to the AI flow.
            const scrapJsonContent = { placeholder: `Data from ${jsonPath}` }; // Placeholder

            const reportOutput = await generateTaggingReport({
                seoReport: { placeholder: "SEO report would be generated here" }, // Placeholder for SEO report
                scrapJson: scrapJsonContent,
            });

            await jobDocRef.update({
                status: "analytic_core_completed",
                analyticCoreDraft: reportOutput.report,
            });

            response.status(200).send({ message: "Analytic Core completed successfully." });

        } catch (error) {
            const { jobId } = request.body;
            logger.error(`Error in startAnalyticCore for job ${jobId}:`, error);
            if (jobId) {
                 try {
                    await firestore.collection("jobs").doc(jobId).update({
                        status: "failed",
                        error: "Analytic Core process failed.",
                    });
                } catch (firestoreError) {
                    logger.error(`Failed to update Firestore for job ${jobId} after Analytic Core error:`, firestoreError);
                }
            }
            response.status(500).send("Internal Server Error");
        }
    });
});


export const startTagOpsHub = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    const {jobId, modifiedMarkdown} = request.body;

    if (!modifiedMarkdown || !jobId) {
      response.status(400).send("Missing required parameters: modifiedMarkdown, jobId");
      return;
    }
    
    const jobDocRef = firestore.collection("jobs").doc(jobId);

    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName) {
      logger.error("GCS_BUCKET environment variable not set.");
      response.status(500).send("Server configuration error.");
      return;
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

      response.status(200).send({pdfUrl});
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
      response.status(500).send("Failed to generate PDF.");
    }
  });
});


export * from "./mcpProxy";
