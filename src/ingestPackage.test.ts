import { ingestPackage } from '/src/ingestPackage';
import fetch from 'node-fetch';  // Mocking fetch
import { netScore } from '../metric_score';  // Mocking netScore

jest.mock('node-fetch');
jest.mock('../metric_score');

// Mocking the fetch function from node-fetch
const { Response } = jest.requireActual('node-fetch');

// Sample mock data for npm package
const mockPackageData = {
  repository: {
    url: 'git+https://github.com/expressjs/express.git',
  },
};

// Mock netScore function return value
const mockNetScore = {
  BusFactor: 0.7,
  Correctness: 0.8,
  RampUp: 0.9,
  ResponsiveMaintainer: 0.6,
  License: 0.9,
};

// Cast fetch globally as a mocked function
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ingestPackage function', () => {
  beforeEach(() => {
    jest.clearAllMocks();  // Reset mocks before each test
  });

  it('should fetch npm package data and upload if score meets criteria', async () => {
    // Mock fetch response for the npm package data
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockPackageData))
    );

    // Mock netScore function response
    (netScore as jest.Mock).mockResolvedValue(mockNetScore);

    // Mock fetch response for the upload
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

    const result = await ingestPackage('express');
    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledTimes(2);  // Called for npm data and upload
  });
});
