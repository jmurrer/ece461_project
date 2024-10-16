import fetch from 'node-fetch';
import { netScore } from './metric_score';

// Define types for the expected structures
interface PackageData {
  repository?: {
    url: string;
  };
}

// Function to fetch npm package data
async function fetchNpmPackageData(packageName: string): Promise<PackageData> {
  const apiUrl = `https://registry.npmjs.org/${packageName}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Error fetching package data: ${response.statusText}`);
  }

  const packageData: PackageData = await response.json();

  // Check if repository exists before accessing it
  if (!packageData.repository || !packageData.repository.url) {
    throw new Error('Repository URL not found in the package data');
  }

  return packageData;
}


// Function to check if the package meets minimum score requirements
async function checkPackageRating(repoUrl: string): Promise<boolean> {
  // Fetch the netScore and metrics for the given repository URL
  const rating = await netScore(repoUrl);

  // Define the required metrics and their minimum threshold values
  const requiredMetrics: Record<string, number> = {
    BusFactor: 0.5,
    Correctness: 0.5,
    RampUp: 0.5,
    ResponsiveMaintainer: 0.5,
    License: 0.5,
  };

  // Check if each required metric meets the minimum score
  for (const [metric, minValue] of Object.entries(requiredMetrics)) {
    if (rating[metric] < minValue) {
      throw new Error(
        `Package does not meet the minimum score for ${metric}. Score: ${rating[metric]}, required: ${minValue}`
      );
    }
  }

  // If all metrics meet the minimum requirements, return true
  return true;
}

// Function to upload package to registry
async function uploadPackageToRegistry(packageData: PackageData): Promise<any> {
  const apiUrl = '/upload-endpoint';  // Update with actual endpoint
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packageData),
  });

  if (!response.ok) {
    throw new Error('Error uploading package');
  }

  return response.json();
}

// Ingestion process
export async function ingestPackage(packageName: string): Promise<any> {
  const packageData = await fetchNpmPackageData(packageName);

  // Extract repository URL and clean it up
  const repoUrl = packageData.repository.url.replace('git+', '').replace('.git', '');

  // Check if the package meets the rating requirements
  await checkPackageRating(repoUrl);

  // Upload package to the registry
  return uploadPackageToRegistry(packageData);
}

// Example usage
(async () => {
  try {
    const result = await ingestPackage('express');  // Example package
    console.log('Package uploaded successfully:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
