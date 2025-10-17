import express, { Request, Response } from 'express';
import { chromium } from 'playwright';
import { Storage } from '@google-cloud/storage';
import fs from 'fs-extra';
import path from 'path';
import * as admin from 'firebase-admin';

const app = express();
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const firestore = admin.firestore();


const storage = new Storage();

app.post('/scrape', async (req: Request, res: Response) => {
    const { url, pages, device, jobId } = req.body;

    if (!url || !pages || !device || !jobId) {
        return res.status(400).send('Missing required parameters: url, pages, device, jobId');
    }

    const bucketName = process.env.GCS_BUCKET;
    if (!bucketName) {
        console.error('GCS_BUCKET environment variable not set.');
        return res.status(500).send('Server configuration error.');
    }

    // Immediately respond to the client that the job is received and will be processed.
    res.status(202).send({ message: `Scraping job ${jobId} received and is processing.` });

    try {
        const browser = await chromium.launch({ args: ['--no-sandbox'] });
        const context = await browser.newContext({
            viewport: device === 'mobile' ? { width: 375, height: 812 } : { width: 1920, height: 1080 },
            deviceScaleFactor: device === 'mobile' ? 2 : 1,
        });
        const page = await context.newPage();

        const outputDir = path.join('/tmp', jobId);
        await fs.ensureDir(outputDir);
        const coordmapsDir = path.join(outputDir, 'coordmaps');
        const cropsDir = path.join(outputDir, 'crops');
        const screensDir = path.join(outputDir, 'screens');
        await fs.ensureDir(coordmapsDir);
        await fs.ensureDir(cropsDir);
        await fs.ensureDir(screensDir);

        const allPagesData: any[] = [];

        for (let i = 0; i < pages; i++) {
            const targetUrl = new URL(url);
            // This is a simple example for multi-page, a real implementation would have a more robust way of finding pages.
            if (i > 0) {
                 const links = await page.$$('a');
                 if(links.length > i) {
                    const nextUrl = await links[i].getAttribute('href');
                    if(nextUrl) {
                        try {
                           const absoluteUrl = new URL(nextUrl, url);
                           targetUrl.href = absoluteUrl.href;
                        } catch (e) {
                            // ignore invalid URLs
                        }
                    }
                 }
            }


            await page.goto(targetUrl.href, { waitUntil: 'networkidle' });

            const screenshotPath = path.join(screensDir, `screen_${i}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });

            // In a real scenario, you would have logic to generate coordmaps and crops.
            // For this demo, we'll create placeholder files.
            const coordmapPath = path.join(coordmapsDir, `coordmap_${i}.json`);
            await fs.writeJson(coordmapPath, { note: `Coordinates for page ${i}` });
            const cropPath = path.join(cropsDir, `crop_${i}.png`);
            // Creating a dummy crop file
            await fs.copy(screenshotPath, cropPath);

            const gcsBasePath = `jobs/${jobId}/input`;
            allPagesData.push({
                page_number: i,
                url: targetUrl.href,
                screenshot: `gs://${bucketName}/${gcsBasePath}/screens/screen_${i}.png`,
                coordmap: `gs://${bucketName}/${gcsBasePath}/coordmaps/coordmap_${i}.json`,
                crop: `gs://${bucketName}/${gcsBasePath}/crops/crop_${i}.png`
            });
        }


        const allPagesPath = path.join(outputDir, 'all_pages.json');
        await fs.writeJson(allPagesPath, allPagesData);


        const bucket = storage.bucket(bucketName);
        const gcsBasePath = `jobs/${jobId}/input/`;

        // Upload all generated files to GCS
        const uploadDir = async (dir: string, gcsDir: string) => {
            const files = await fs.readdir(dir);
            for (const file of files) {
                const localPath = path.join(dir, file);
                await bucket.upload(localPath, {
                    destination: `${gcsDir}${file}`,
                });
            }
        };

        await uploadDir(screensDir, `${gcsBasePath}screens/`);
        await uploadDir(coordmapsDir, `${gcsBasePath}coordmaps/`);
        await uploadDir(cropsDir, `${gcsBasePath}crops/`);
        await bucket.upload(allPagesPath, {
             destination: `${gcsBasePath}all_pages.json`,
        });


        await browser.close();
        await fs.remove(outputDir);

        // Update Firestore document to indicate successful scraping
        const insightForgeOutput = {
          jsonPath: `gs://${bucketName}/${gcsBasePath}all_pages.json`,
          imagesBasePath: `gs://${bucketName}/${gcsBasePath}`,
        };

        await firestore.collection('jobs').doc(jobId).update({
            status: 'insight_forge_completed',
            insightForgeOutput: insightForgeOutput
        });
        console.log(`Scraping job ${jobId} completed successfully.`);

    } catch (error) {
        console.error(`Error during scraping job ${jobId}:`, error);
        // Update Firestore document to indicate failure
        await firestore.collection('jobs').doc(jobId).update({
            status: 'failed',
            error: (error as Error).message || 'An unknown error occurred during scraping.',
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Scraper service listening on port ${PORT}`);
});
