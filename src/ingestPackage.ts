import { netScore } from './metric_score'; 
import { info } from './logger'; 

export async function checkAndIngestPackage(packageUrl: string) {
  try {
    const metrics = await netScore(packageUrl);
    const { BusFactor, Correctness, RampUp, ResponsiveMaintainer, License } = metrics;

    // Debugging: Log the metrics
    console.log('Metrics:', metrics);

    if (
      BusFactor >= 0.5 &&
      Correctness >= 0.5 &&
      RampUp >= 0.5 &&
      ResponsiveMaintainer >= 0.5 &&
      License >= 0.5
    ) {
      // Debugging: Log when ingestPackage is about to be called
      console.log('Calling ingestPackage for:', packageUrl);

      await ingestPackage(packageUrl);
      await info(`Package ${packageUrl} has been ingested successfully.`);
    } else {
      throw new Error(`Package ${packageUrl} failed the ingestion criteria.`);
    }
  } catch (error) {
    await info(`Error processing package ${packageUrl}: ${error.message}`);
  }
}

export async function ingestPackage(packageUrl: string) {
  console.log('checkAndIngestPackage is running');
  console.log(`Ingesting package: ${packageUrl}`);
}
