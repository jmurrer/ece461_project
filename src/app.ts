import * as ms from "./metric_score.js";
import * as fs from "fs/promises";
import * as path from "path";
import { info, debug, silent } from "./logger.js";

async function processUrl(url: string) {
  try {
    const score = await ms.netScore(url);
    await info(`Processed URL: ${url}, Score: ${score}`);
    let ret = {
      URL: url,
      NetScore: score.NET_SCORE,
      RampUp: score.RAMP_UP_SCORE,
      Correctness: score.CORRECTNESS_SCORE,
      BusFactor: score.BUS_FACTOR_SCORE,
      ResponsiveMaintainer: score.RESPONSIVE_MAINTAINER_SCORE,
      License: score.LICENSE_SCORE,
      NetScore_Latency: 0,
      RampUp_Latency: 0,
      Correctness_Latency: 0,
      BusFactor_Latency: 0,
      ResponsiveMaintainer_Latency: 0,
      License_Latency: 0,
    };
    return ret;
  } catch (err) {
    await silent(`Error processing ${url}: ${err.message}`);
    return { URL: url, NetScore: -1 };
  }
}

export async function main(testFile?: string) {
  await info("Program started");
  // check if filename provided
  if (process.argv.length < 3 && !testFile) {
    await silent("Usage: npm start <filename>");
    process.exit(1);
  }

  const filename = testFile ? testFile : process.argv[2];
  let ndjsonOutput;

  try {
    // read file content
    const filePath = path.resolve(filename);
    const fileContent = await fs.readFile(filePath, "utf-8");

    // split file content by newline and filter empty lines
    const urls = fileContent.split("\n").filter((line) => line.trim() !== "");
    await info(`Processing ${urls.length} URLs from file: ${filename}`);

    // Process all URLs in parallel
    const results = await Promise.all(urls.map((url) => processUrl(url)));

    // Prep NDJSON output
    ndjsonOutput = results.map((result) => JSON.stringify(result)).join("\n");

    // print output to console
    console.log(ndjsonOutput);
  } catch (err) {
    await silent(`Error reading file: ${filename}. Error: ${err.message}`);
    process.exit(1);
  } finally {
    if (testFile) {
      return ndjsonOutput;
    } else {
      await info("Program ended");
      process.exit(0);
    }
  }
}

// Only call main if this file is being run directly outside of Jasmine
if (
  !process.argv[1].endsWith("jasmine.js") &&
  !process.argv[1].endsWith("jasmine")
) {
  main();
}
