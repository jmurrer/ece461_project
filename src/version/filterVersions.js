const semver = require('semver');

// Function to filter versions based on version range
function filterVersions(versions, versionRange) {
  if (!versionRange) {
    return versions; // If no range is provided, return all versions
  }

  // Handle bounded ranges (e.g., "1.2.3-2.1.0")
  if (versionRange.includes('-')) {
    const [minVersion, maxVersion] = versionRange.split('-');
    return versions.filter(
      (version) => semver.gte(version, minVersion) && semver.lte(version, maxVersion)
    );
  }

  // Use semver to filter based on the version range for other cases
  return versions.filter((version) => semver.satisfies(version, versionRange));
}

module.exports = filterVersions;
