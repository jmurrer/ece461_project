const AWS = require('aws-sdk');

// Set up AWS DynamoDB
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
});

// Fetch paginated list of packages
async function fetchPackages(limit = 100, offset = 0) {
  const params = {
    TableName: 'PackageRegistry',
    Limit: limit,
    ExclusiveStartKey: offset > 0 ? { packageID: offset } : undefined, // Pagination key
  };

  try {
    const result = await dynamoDB.scan(params).promise();
    return {
      packages: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw new Error('Failed to fetch packages');
  }
}

module.exports = { fetchPackages };
