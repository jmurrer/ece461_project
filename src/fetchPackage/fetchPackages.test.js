const AWS = require('aws-sdk');
const { fetchPaginatedPackages } = require('./fetchPackages');

// Mock the AWS config and DynamoDB DocumentClient
jest.mock('aws-sdk', () => {
  const mockDocumentClient = {
    scan: jest.fn()
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient)
    },
    config: {
      update: jest.fn()
    }
  };
});

const dynamoDBMock = new AWS.DynamoDB.DocumentClient();

describe('fetchPaginatedPackages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch a single page of packages', async () => {
    // Mock the scan method to return a promise that resolves with a single page of packages
    dynamoDBMock.scan.mockImplementation(() => ({
      promise: jest.fn().mockResolvedValueOnce({
        Items: [{ PackageName: 'package1' }, { PackageName: 'package2' }],
        LastEvaluatedKey: null
      })
    }));

    const result = await fetchPaginatedPackages();
    expect(result).toEqual([
      { PackageName: 'package1' },
      { PackageName: 'package2' }
    ]);
  });

  test('should fetch multiple pages of packages', async () => {
    // Mock the scan method to return a promise that resolves with multiple pages
    dynamoDBMock.scan
      .mockImplementationOnce(() => ({
        promise: jest.fn().mockResolvedValueOnce({
          Items: [{ PackageName: 'package1' }],
          LastEvaluatedKey: 'next-page'
        })
      }))
      .mockImplementationOnce(() => ({
        promise: jest.fn().mockResolvedValueOnce({
          Items: [{ PackageName: 'package2' }],
          LastEvaluatedKey: null
        })
      }));

    const result = await fetchPaginatedPackages();
    expect(result).toEqual([
      { PackageName: 'package1' },
      { PackageName: 'package2' }
    ]);
  });

  test('should handle an empty result set', async () => {
    // Mock the scan method to return an empty result set
    dynamoDBMock.scan.mockImplementation(() => ({
      promise: jest.fn().mockResolvedValueOnce({
        Items: [],
        LastEvaluatedKey: null
      })
    }));

    const result = await fetchPaginatedPackages();
    expect(result).toEqual([]);
  });

  test('should handle DynamoDB errors gracefully', async () => {
    // Mock the scan method to throw an error
    dynamoDBMock.scan.mockImplementation(() => ({
      promise: jest.fn().mockRejectedValueOnce(new Error('DynamoDB error'))
    }));

    try {
      await fetchPaginatedPackages();
    } catch (error) {
      expect(error.message).toBe('DynamoDB error');
    }
  });
});
