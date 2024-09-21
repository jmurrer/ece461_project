import * as ms from "./metric_score.js";
import * as fs from "fs/promises";
import * as path from "path";

async function processUrl(url: string) {
  try {
    const score = await ms.netScore(url);
    return { url, score: JSON.parse(score) };
  } catch (err) {
    console.error("Error processing ", url, ": ", err);
    return { url, error: err.message };
  }
}

export async function main(testFile?: string) {
    // check if filename provided
    if (process.argv.length < 3 && !testFile) {
        console.error('Usage: npm start <filename>');
        process.exit(1);
    }

    const filename = testFile ? testFile : process.argv[2];
    let ndjsonOutput;

    try {
        // read file content
        const filePath = path.resolve(filename);
        const fileContent = await fs.readFile(filePath, 'utf-8');

        // split file content by newline and filter empty lines
        const urls = fileContent.split('\n').filter(line => line.trim() !== '');
    
        // Process all URLs in parallel
        const results = await Promise.all(urls.map(url => processUrl(url)));

        // Prep NDJSON output
        ndjsonOutput = results.map(result => JSON.stringify(result)).join('\n');

        // print output to console
        console.log(ndjsonOutput);
    } catch (err) {
        console.error('Error reading file: ', err);
    } finally {
        if (testFile) {
            return ndjsonOutput;
        }
        else {
            process.exit(0);
        }
    }

}

// Only call main if this file is being run directly outside of Jasmine
if (!process.argv[1].endsWith('jasmine.js') && !process.argv[1].endsWith('jasmine')) {
    main();
}