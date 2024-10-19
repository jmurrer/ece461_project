const axios = require('axios');

// Mock function for fetching package metadata (replace with actual API call)
async function fetchPackageMetadata(packageID) {
  const response = await axios.get(`https://api.example.com/package/${packageID}`, {
    headers: { 'X-Authorization': 'your-auth-token' }
  });
  return response.data;
}

// Function to calculate the size cost of a package and its transitive dependencies
async function calculatePackageSize(packageID, includeDependencies = true, visited = new Set()) {
  // Avoid double-counting shared dependencies
  if (visited.has(packageID)) {
    return 0;
  }
  
  visited.add(packageID);

  const packageData = await fetchPackageMetadata(packageID);
  const packageSize = packageData.data.Content.size || 0; // Assuming size is in Content object

  // If dependencies are excluded, return standalone cost
  if (!includeDependencies || !packageData.metadata.dependencies || packageData.metadata.dependencies.length === 0) {
    return packageSize;
  }

  // Recursively calculate the size of dependencies
  let totalSize = packageSize;
  for (const depID of packageData.metadata.dependencies) {
    totalSize += await calculatePackageSize(depID, includeDependencies, visited);
  }

  return totalSize;
}

// Function to check the cumulative size cost of multiple packages
async function checkCumulativeSizeCost(packageIDs, includeDependencies = true) {
  const visited = new Set();
  const packageCosts = {};

  let totalCost = 0;

  // Calculate the cost for each package
  for (const packageID of packageIDs) {
    const sizeCost = await calculatePackageSize(packageID, includeDependencies, visited);
    packageCosts[packageID] = sizeCost;
    totalCost += sizeCost;
  }

  return {
    totalCost,
    individualCosts: packageCosts
  };
}

// Export the functions for use in other modules
module.exports = {
  fetchPackageMetadata,
  calculatePackageSize,
  checkCumulativeSizeCost,
};
