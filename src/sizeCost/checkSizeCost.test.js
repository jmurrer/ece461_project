const { checkSizeCost, resetRegistry } = require('./checkSizeCost');
const AWS = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mockDynamoDB = {
    get: jest.fn().mockReturnThis(),
    scan: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDynamoDB),
    },
  };
});

describe('checkSizeCost', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient().promise.mockReset();
  });

  test('should calculate the total size of a package and its dependencies', async () => {
    AWS.DynamoDB.DocumentClient().promise
      .mockResolvedValueOnce({ Item: { packageID: 'pkg1', size: 100, dependencies: ['pkg2'] } })
      .mockResolvedValueOnce({ Item: { packageID: 'pkg2', size: 50, dependencies: [] } });

    const result = await checkSizeCost(['pkg1']);
    expect(result.totalCost).toBe(150);
  });

  test('should calculate the size for multiple packages and shared dependencies', async () => {
    AWS.DynamoDB.DocumentClient().promise
      .mockResolvedValueOnce({ Item: { packageID: 'pkg1', size: 100, dependencies: ['pkg2'] } })
      .mockResolvedValueOnce({ Item: { packageID: 'pkg2', size: 50, dependencies: [] } })
      .mockResolvedValueOnce({ Item: { packageID: 'pkg3', size: 80, dependencies: ['pkg2'] } });

    const result = await checkSizeCost(['pkg1', 'pkg3']);
    expect(result.totalCost).toBe(230); // pkg1 (100) + pkg2 (50) + pkg3 (80), pkg2 counted once
  });

  test('should handle packages with no dependencies', async () => {
    AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({
      Item: { packageID: 'pkg1', size: 100, dependencies: [] },
    });

    const result = await checkSizeCost(['pkg1']);
    expect(result.totalCost).toBe(100);
  });
});

describe('resetRegistry', () => {
  test('should reset the registry and restore default user', async () => {
    AWS.DynamoDB.DocumentClient().promise.mockResolvedValueOnce({ Items: [{ packageID: 'pkg1' }] });

    const result = await resetRegistry();
    expect(result).toBe('Registry reset to default state');
  });
});
