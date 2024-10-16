const AWS = require('aws-sdk');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
});

// Function to recursively fetch the size of a package and its dependencies
async function fetchPackageSize(packageID, visited = new Set()) {
  // Avoid infinite recursion on circular dependencies
  if (visited.has(packageID)) {
    return 0;
  }
  
  visited.add(packageID);

  // Get the package from DynamoDB
  const params = {
    TableName: 'PackageRegistry', // Replace with your actual table name
    Key: { packageID },
  };

  const result = await dynamoDB.get(params).promise();
  const pkg = result.Item;

  if (!pkg) {
    throw new Error(`Package with ID ${packageID} not found`);
  }

  // Base size of the package (direct size)
  let totalSize = pkg.size || 0;

  // Recursively calculate the size of each dependency
  if (pkg.dependencies && pkg.dependencies.length > 0) {
    for (const depID of pkg.dependencies) {
      totalSize += await fetchPackageSize(depID, visited);
    }
  }

  return totalSize;
}

// Check size cost of multiple packages at once
async function checkSizeCost(packageIDs) {
  const visited = new Set();
  let totalCost = 0;

  for (const packageID of packageIDs) {
    totalCost += await fetchPackageSize(packageID, visited);
  }

  return {
    totalCost,
    individualCosts: Array.from(visited).map(id => ({ packageID: id, size: totalCost })),
  };
}

// Reset the registry to its default state
async function resetRegistry() {
  // Here, we will clear the package registry by deleting all items in the table
  const params = {
    TableName: 'PackageRegistry', // Replace with your table name
  };

  const scanResult = await dynamoDB.scan(params).promise();
  const deletePromises = scanResult.Items.map(item => {
    const deleteParams = {
      TableName: 'PackageRegistry',
      Key: { packageID: item.packageID },
    };
    return dynamoDB.delete(deleteParams).promise();
  });

  await Promise.all(deletePromises);

  // Optionally, you can add the default user again
  const defaultUserParams = {
    TableName: 'PackageRegistry',
    Item: { packageID: 'default-user', name: 'default', size: 0 },
  };
  await dynamoDB.put(defaultUserParams).promise();

  return 'Registry reset to default state';
}

module.exports = { checkSizeCost, resetRegistry };
