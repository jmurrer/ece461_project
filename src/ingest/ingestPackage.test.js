const { ingestPackage } = require('./packageIngestion');

test('Ingest a package and check rating', async () => {
  try {
    const result = await ingestPackage('express');
    expect(result).toHaveProperty('uploadSuccess', true);
  } catch (error) {
    expect(error.message).toMatch(/does not meet the minimum score/);
  }
});
