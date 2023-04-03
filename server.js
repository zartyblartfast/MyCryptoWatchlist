const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the cors middleware to set the Access-Control-Allow-Origin header
app.use(cors());

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
