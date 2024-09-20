import * as ms from './metric_score.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function processUrl(url:string) {
    try {
        const score = await ms.netScore(url);
        console.log(url, ':');
        console.log(score);
    } catch (err) {
        console.error('Error processing ', url, ": ", err);
    }
    console.log("URL processed");
}

async function main() {
    // check if filename provided
    if (process.argv.length < 3) {
        console.error('Usage: npm start <filename>');
        process.exit(1);
    }

    const filename = process.argv[2];

    try {
        // read file content
        const filePath = path.resolve(filename);
        const fileContent = await fs.readFile(filePath, 'utf-8');

        // split file content by newline and filter empty lines
        const urls = fileContent.split('\n').filter(line => line.trim() !== '');
    
        // Process all URLs in parallel
        await Promise.all(urls.map(url => processUrl(url)))
    } catch (err) {
        console.error('Error reading file: ', err);
    } finally {
        process.exit(0);
    }
}

main();
