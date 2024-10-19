const request = require('supertest');
const { app, server } = require('./resetRegistry'); // Adjust path if necessary

describe('Reset registry endpoint', () => {
  // Close the server after all tests
  afterAll((done) => {
    server.close(done); // Close the server after tests
  });

  it('should reset the registry and respond with 200', async () => {
    const response = await request(app)
      .delete('/reset')
      .set('x-authorization', 'valid-token'); // Assuming a valid token
    expect(response.status).toBe(200);
    expect(response.text).toBe('Registry is reset.');
  });

  it('should return 403 if no authentication token is provided', async () => {
    const response = await request(app).delete('/reset');
    expect(response.status).toBe(403);
  });
});
