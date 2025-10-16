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

const corsHandler = cors({origin: true});

const firestore = new Firestore();

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

      // Do not await this call
      axios.post("https://scraper-service-896195877995.us-central1.run.app/scrape", {
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

export * from "./mcpProxy";
