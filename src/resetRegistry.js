const express = require('express');
const app = express();

// In-memory store to simulate the registry
let registry = [];
let users = [{ name: 'defaultAdmin', isAdmin: true }];

// Middleware to check authentication
function authenticate(req, res, next) {
  const token = req.headers['x-authorization'];
  if (!token) {
    return res.status(403).send('Authentication failed due to invalid or missing AuthenticationToken.');
  }
  next();
}

// Reset registry route (DELETE /reset)
app.delete('/reset', authenticate, (req, res) => {
  try {
    registry = [];
    users = [{ name: 'defaultAdmin', isAdmin: true }];
    res.status(200).send('Registry is reset.');
  } catch (error) {
    res.status(500).send('An error occurred while resetting the registry.');
  }
});

// Start the server
const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Export the app and server
module.exports = { app, server };
