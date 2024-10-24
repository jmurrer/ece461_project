const filterVersions = require('./filterVersions'); // Import the function from filterVersions.js

// Mock data for testing
const mockVersions = [
  "1.0.0",
  "1.1.0",
  "1.2.3",
  "1.3.0",
  "2.0.0",
  "2.1.0",
  "3.0.0"
];

// Test cases
describe("Version Filtering", () => {
  test("should return all versions when no range is provided", () => {
    const result = filterVersions(mockVersions);
    expect(result).toEqual(mockVersions);
  });

  test("should return the exact version when provided", () => {
    const result = filterVersions(mockVersions, "1.2.3");
    expect(result).toEqual(["1.2.3"]);
  });

  test("should return versions within a bounded range", () => {
    const result = filterVersions(mockVersions, "1.2.3-2.1.0");
    expect(result).toEqual(["1.2.3", "1.3.0", "2.0.0", "2.1.0"]);
  });

  test("should return versions matching tilde range", () => {
    const result = filterVersions(mockVersions, "~1.2.0");
    expect(result).toEqual(["1.2.3"]);
  });

  test("should return versions matching caret range", () => {
    const result = filterVersions(mockVersions, "^1.2.0");
    // Adjust expected value to include only versions within 1.x.x range
    expect(result).toEqual(["1.2.3", "1.3.0"]);
  });

  test("should return empty when no versions match the provided range", () => {
    const result = filterVersions(mockVersions, "4.0.0");
    expect(result).toEqual([]);
  });
});
