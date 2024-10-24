const express = require('express');
const AWS = require('aws-sdk');
const filterVersions = require('../filterVersions'); // Import the utility function

const app = express();
app.use(express.json());

// Set up AWS DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
});

// Fetch package versions endpoint
app.get('/package/:name/versions', async (req, res) => {
  const packageName = req.params.name;
  const { versionRange } = req.query;

  try {
    // Fetch package metadata from AWS DynamoDB (mocked here for example)
    const packageData = await fetchPackageDataFromDynamoDB(packageName);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Validate version range before applying it
    if (versionRange && !semver.validRange(versionRange)) {
      return res.status(400).json({ error: 'Invalid version range' });
    }

    // Filter versions based on versionRange query parameter
    const filteredVersions = filterVersions(packageData.versions, versionRange);

    return res.json({
      packageName: packageName,
      availableVersions: filteredVersions,
    });
  } catch (err) {
    console.error('Error fetching package versions:', err);
    return res.status(500).json({ error: 'Error fetching package versions' });
  }
});

// Mock function to fetch package data from AWS DynamoDB
async function fetchPackageDataFromDynamoDB(packageName) {
  // Query the DynamoDB table
  const params = {
    TableName: 'PackageRegistry',
    Key: {
      packageName: packageName,
    },
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
