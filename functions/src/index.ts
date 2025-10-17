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

const corsHandler = cors({origin: true});

const firestore = new Firestore();
const storage = new Storage();

setGlobalOptions({maxInstances: 10});

export const startAnalysisJob = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    try {
      const {url, pages, device, agentType} = request.body;

      if (!url || !pages || !device || !agentType) {
        response.status(400).send("Missing required parameters.");
        return;
      }

      const jobId = uuidv4();

      await firestore.collection("jobs").doc(jobId).set({
        status: "pending",
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
      logger.error("Error starting analysis job:", error);
      response.status(500).send("Internal Server Error");
    }
  });
});


export const generatePdf = onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    const {markdownContent, jobId} = request.body;

    if (!markdownContent || !jobId) {
      response.status(400).send("Missing required parameters: markdownContent, jobId");
      return;
    }

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
      await firestore.collection("jobs").doc(jobId).update({status: "generating_pdf"});

      const browser = await puppeteer.launch({args: ["--no-sandbox"]});
      const page = await browser.newPage();

      const htmlContent = marked(markdownContent);

      await page.setContent(htmlContent, {waitUntil: "networkidle0"});
      const pdfBuffer = await page.pdf({format: "A4", printBackground: true});

      await browser.close();

      await file.save(pdfBuffer, {
        metadata: {
          contentType: "application/pdf",
        },
      });

      const pdfUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

      await firestore.collection("jobs").doc(jobId).update({
        status: "completed",
        pdfUrl: pdfUrl,
      });

      response.status(200).send({pdfUrl});
    } catch (error) {
      logger.error(`Error generating PDF for job ${jobId}:`, error);
      try {
        await firestore.collection("jobs").doc(jobId).update({
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
