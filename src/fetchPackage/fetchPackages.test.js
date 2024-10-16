const { fetchPackages } = require('./fetchPackages');
const AWS = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mockDynamoDB = {
    scan: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDynamoDB),
    },
  };
});

describe('fetchPackages', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient().promise.mockReset();
  });

  test('should fetch the first page of packages', async () => {
    AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({
      Items: [
        { packageID: 'pkg1', name: 'package1', version: '1.0.0' },
        { packageID: 'pkg2', name: 'package2', version: '1.1.0' },
      ],
      LastEvaluatedKey: 'pkg101',
    });

    const result = await fetchPackages(2, 0);

    expect(result.packages).toEqual([
      { packageID: 'pkg1', name: 'package1', version: '1.0.0' },
      { packageID: 'pkg2', name: 'package2', version: '1.1.0' },
    ]);
    expect(result.lastEvaluatedKey).toBe('pkg101');
  });

  test('should fetch the next page of packages', async () => {
    AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({
      Items: [
        { packageID: 'pkg101', name: 'package101', version: '1.0.1' },
        { packageID: 'pkg102', name: 'package102', version: '1.1.1' },
      ],
      LastEvaluatedKey: 'pkg201',
    });

    const result = await fetchPackages(2, 'pkg101');

    expect(result.packages).toEqual([
      { packageID: 'pkg101', name: 'package101', version: '1.0.1' },
      { packageID: 'pkg102', name: 'package102', version: '1.1.1' },
    ]);
    expect(result.lastEvaluatedKey).toBe('pkg201');
  });

  test('should handle empty result', async () => {
    AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({
      Items: [],
      LastEvaluatedKey: null,
    });

    const result = await fetchPackages(100, 0);

    expect(result.packages).toEqual([]);
    expect(result.lastEvaluatedKey).toBeNull();
  });

  test('should throw an error if DynamoDB scan fails', async () => {
    AWS.DynamoDB.DocumentClient().promise.mockRejectedValueOnce(new Error('DynamoDB error'));

    await expect(fetchPackages(100, 0)).rejects.toThrow('Failed to fetch packages');
  });
});
