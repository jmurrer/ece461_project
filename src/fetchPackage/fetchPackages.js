const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' }); // Set your AWS region here
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Function to fetch packages from a hypothetical paginated package registry API
async function fetchPaginatedPackages(lastEvaluatedKey = null) {
  const params = {
    TableName: 'PackageDirectory',
    Limit: 100, // Fetch 100 packages at a time
    ExclusiveStartKey: lastEvaluatedKey // Pagination starts from the last key
  };

  try {
    const data = await dynamoDB.scan(params).promise();

    console.log(`Fetched ${data.Items.length} packages`);

    // Process the fetched data
    const packages = [...data.Items];

    // If there's more data, recursively fetch the next batch
    if (data.LastEvaluatedKey) {
      const nextPackages = await fetchPaginatedPackages(data.LastEvaluatedKey);
      packages.push(...nextPackages);
    }

    return packages; // Return the processed packages
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
}

module.exports = {
  fetchPaginatedPackages
};
