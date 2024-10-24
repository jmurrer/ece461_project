// Ensure that axios is properly mocked
jest.mock('axios');

// Import the mocked version of axios
const axios = require('axios');
const { calculatePackageSize, checkCumulativeSizeCost } = require('./checkSizeCost'); // Your actual functions

describe('calculatePackageSize', () => {
  beforeEach(() => {
    // Clear all mocks before each test case
    jest.clearAllMocks();
  });

  test('should return standalone cost when no dependencies are included', async () => {
    // Mock axios response for a single package with no dependencies
    axios.get.mockResolvedValueOnce({
      data: {
        metadata: { dependencies: [] },
        data: { Content: { size: 50 } }  // Mock the package size as 50MB
      }
    });

    const packageSize = await calculatePackageSize('package1', false); // Exclude dependencies
    expect(packageSize).toBe(50); // Standalone size is 50 MB
  });

  test('should return total cost with dependencies', async () => {
    // Mock axios response for package1 and package2
    axios.get
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: ['package2'] },
          data: { Content: { size: 50 } }  // Mock size of package1 as 50MB
        }
      })
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: [] },
          data: { Content: { size: 30 } }  // Mock size of package2 as 30MB
        }
      });

    const packageSize = await calculatePackageSize('package1', true); // Include dependencies
    expect(packageSize).toBe(80); // 50 MB + 30 MB (dependency)
  });

  test('should avoid double-counting shared dependencies', async () => {
    // Mock axios response for package1 and shared package2
    axios.get
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: ['package2'] },
          data: { Content: { size: 50 } }  // Mock size of package1 as 50MB
        }
      })
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: [] },
          data: { Content: { size: 30 } }  // Mock size of package2 as 30MB
        }
      });

    const size1 = await calculatePackageSize('package1', true, new Set());
    expect(size1).toBe(80); // 50 MB + 30 MB (package1 + package2)

    // Ensure that calling package2 separately does not recount its size
    const size2 = await calculatePackageSize('package2', true, new Set(['package2']));
    expect(size2).toBe(0); // package2 is already counted, so the size is 0
  });
});

describe('checkCumulativeSizeCost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should calculate cumulative size for multiple packages', async () => {
    // Mock the response for two packages
    axios.get
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: ['package2'] },
          data: { Content: { size: 50 } }  // Package1 size is 50 MB
        }
      })
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: [] },
          data: { Content: { size: 30 } }  // Package2 size is 30 MB
        }
      })
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: [] },
          data: { Content: { size: 70 } }  // Package3 size is 70 MB
        }
      });

    const result = await checkCumulativeSizeCost(['package1', 'package3'], true);
    expect(result).toEqual({
      totalCost: 150,  // 50 MB (package1) + 30 MB (package2, shared) + 70 MB (package3)
      individualCosts: {
        'package1': 80,  // 50 MB + 30 MB (package1 + package2)
        'package3': 70   // Package3 has no dependencies
      }
    });
  });

  test('should handle packages with no dependencies', async () => {
    // Mock the response for a package with no dependencies
    axios.get.mockResolvedValueOnce({
      data: {
        metadata: { dependencies: [] },
        data: { Content: { size: 50 } }  // Package1 size is 50 MB
      }
    });

    const result = await checkCumulativeSizeCost(['package1'], true);
    expect(result).toEqual({
      totalCost: 50,  // Only the standalone cost
      individualCosts: {
        'package1': 50
      }
    });
  });

  test('should avoid counting shared dependencies multiple times', async () => {
    // Mock the response for packages sharing dependencies
    axios.get
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: ['package2'] },
          data: { Content: { size: 50 } }  // Package1 size is 50 MB
        }
      })
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: [] },
          data: { Content: { size: 30 } }  // Package2 size is 30 MB
        }
      })
      .mockResolvedValueOnce({
        data: {
          metadata: { dependencies: ['package2'] },
          data: { Content: { size: 70 } }  // Package3 size is 70 MB
        }
      });

    const result = await checkCumulativeSizeCost(['package1', 'package3'], true);
    expect(result).toEqual({
      totalCost: 150,  // 50 MB (package1) + 30 MB (shared package2) + 70 MB (package3)
      individualCosts: {
        'package1': 80,  // 50 MB + 30 MB (package1 + package2)
        'package3': 70   // 70 MB (package3, with shared dependency)
      }
    });
  });
});
