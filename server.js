const express = require('express');
const browserSync = require('browser-sync');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('./docs', {
  extensions: ['html']
}));

// Custom middleware to handle routing
app.use((req, res, next) => {
  if (req.url.endsWith('/') && !req.url.endsWith('index.html')) {
    req.url += 'index.html';
  } else if (!req.url.endsWith('.html') && !req.url.match(/\.[a-zA-Z0-9]+$/)) {
    req.url += '/index.html';
  }
  next();
});

// Define routes
app.use('/css', express.static(path.join(__dirname, 'docs/css')));
app.use('/js', express.static(path.join(__dirname, 'docs/js')));

// Start the Express server
const server = app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});

// Initialize Browser-Sync
const bs = browserSync.create();
bs.init({
  proxy: `localhost:${port}`,
  files: ["./docs/**/*.{html,htm,css,js}"],
  open: true,
  reloadDelay: 1000,
  watch: true
});
