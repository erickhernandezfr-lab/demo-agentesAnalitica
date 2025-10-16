import express, { Request, Response } from 'express';
import { chromium } from 'playwright';
import { Storage } from '@google-cloud/storage';
import fs from 'fs-extra';
import path from 'path';

const app = express();
app.use(express.json());

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

    try {
        const browser = await chromium.launch();
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
            // This is a simple example, a real implementation would have a more robust way of finding pages
            if (i > 0) {
                 const links = await page.$$('a');
                 if(links.length > i) {
                    const nextUrl = await links[i].getAttribute('href');
                    if(nextUrl) {
                        targetUrl.pathname = nextUrl;
                    }
                 }
            }


            await page.goto(targetUrl.href, { waitUntil: 'networkidle' });

            const screenshotPath = path.join(screensDir, `screen_${i}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });

            // In a real scenario, you would have logic to generate coordmaps and crops
            // For this demo, we'll create placeholder files.
            const coordmapPath = path.join(coordmapsDir, `coordmap_${i}.json`);
            await fs.writeJson(coordmapPath, { note: `Coordinates for page ${i}` });
            const cropPath = path.join(cropsDir, `crop_${i}.png`);
            // Creating a dummy crop file
            await fs.copy(screenshotPath, cropPath);


            allPagesData.push({
                page_number: i,
                url: targetUrl.href,
                screenshot: `gs://${bucketName}/jobs/${jobId}/input/screens/screen_${i}.png`,
                coordmap: `gs://${bucketName}/jobs/${jobId}/input/coordmaps/coordmap_${i}.json`,
                crop: `gs://${bucketName}/jobs/${jobId}/input/crops/crop_${i}.png`
            });
        }


        const allPagesPath = path.join(outputDir, 'all_pages.json');
        await fs.writeJson(allPagesPath, allPagesData);


        const bucket = storage.bucket(bucketName);
        const gcsPath = `jobs/${jobId}/input/`;

        for (const file of await fs.readdir(outputDir)) {
            if( (await fs.stat(path.join(outputDir, file))).isDirectory()) {
                for (const subFile of await fs.readdir(path.join(outputDir, file))) {
                    await bucket.upload(path.join(outputDir, file, subFile), {
                        destination: `${gcsPath}${file}/${subFile}`,
                    });
                }
            } else {
                 await bucket.upload(path.join(outputDir, file), {
                    destination: `${gcsPath}${file}`,
                });
            }
        }


        await browser.close();
        await fs.remove(outputDir);

        res.status(200).send({ message: `Scraping job ${jobId} completed successfully.` });
    } catch (error) {
        console.error(`Error during scraping job ${jobId}:`, error);
        res.status(500).send(`Scraping job ${jobId} failed.`);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Scraper service listening on port ${PORT}`);
});
