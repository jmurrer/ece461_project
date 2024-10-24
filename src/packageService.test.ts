// tests/packageService.test.ts

import { searchPackagesByRegex } from '../src/packageService';

describe('searchPackagesByRegex', () => {
  it('should return matching packages based on name', async () => {
    const result = await searchPackagesByRegex('Underscore');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Underscore');
  });

  it('should return matching packages based on README content', async () => {
    const result = await searchPackagesByRegex('JavaScript library');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('React');
  });

  it('should return no packages if none match', async () => {
    const result = await searchPackagesByRegex('NonExistentPackage');
    expect(result.length).toBe(0);
  });

  it('should match case-insensitively', async () => {
    const result = await searchPackagesByRegex('react');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('React');
  });
});
