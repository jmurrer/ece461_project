import { checkAndIngestPackage } from './ingestPackage'; // Import the actual function
import { netScore } from './metric_score'; // Mock this module
import { info } from './logger'; // Mock logging
import { ingestPackage } from './ingestPackage'; // Mock ingestPackage

jest.mock('./metric_score');
jest.mock('./logger');
jest.mock('./ingestPackage', () => ({
  ...jest.requireActual('./ingestPackage'), // Ensure only `ingestPackage` is mocked, not the whole module
  ingestPackage: jest.fn(), // Mock only `ingestPackage`
}));

describe('checkAndIngestPackage', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });


  test('should fail ingestion when one or more metrics are below the threshold', async () => {
    // Mock the netScore function to return some metrics below the threshold
    (netScore as jest.Mock).mockResolvedValue({
      BusFactor: 0.4, // Below threshold
      Correctness: 0.7,
      RampUp: 0.8,
      ResponsiveMaintainer: 0.9,
      License: 0.95,
    });

    const packageUrl = 'https://npmjs.com/package/example-package';

    await checkAndIngestPackage(packageUrl);

    // Expect the package ingestion NOT to be called
    expect(ingestPackage).not.toHaveBeenCalled();

    // Expect an info log indicating failure
    expect(info).toHaveBeenCalledWith(
      `Error processing package ${packageUrl}: Package ${packageUrl} failed the ingestion criteria.`
    );
  });

  test('should handle errors when fetching the net score', async () => {
    // Mock the netScore function to throw an error
    (netScore as jest.Mock).mockRejectedValue(new Error('Error fetching net score'));

    const packageUrl = 'https://npmjs.com/package/example-package';

    await checkAndIngestPackage(packageUrl);

    // Expect the package ingestion NOT to be called
    expect(ingestPackage).not.toHaveBeenCalled();

    // Expect an info log indicating error in fetching the net score
    expect(info).toHaveBeenCalledWith(
      `Error processing package ${packageUrl}: Error fetching net score`
    );
  });

  test('should log an error message if ingestion fails due to metric thresholds', async () => {
    // Mock the netScore function with a metric failing
    (netScore as jest.Mock).mockResolvedValue({
      BusFactor: 0.5,
      Correctness: 0.3, // Below threshold
      RampUp: 0.9,
      ResponsiveMaintainer: 0.9,
      License: 0.8,
    });

    const packageUrl = 'https://npmjs.com/package/example-package';

    await checkAndIngestPackage(packageUrl);

    // Expect the package ingestion NOT to be called
    expect(ingestPackage).not.toHaveBeenCalled();

    // Expect an info log indicating the package failed to meet the criteria
    expect(info).toHaveBeenCalledWith(
      `Error processing package ${packageUrl}: Package ${packageUrl} failed the ingestion criteria.`
    );
  });
});
