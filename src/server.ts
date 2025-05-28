import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get server and browser folder paths
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

// Log paths for debugging
console.log('Server executing from:', process.cwd());
console.log('Server dist folder path:', serverDistFolder);
console.log('Browser dist folder path:', browserDistFolder);

// Check if browser folder exists
console.log('Browser folder exists:', fs.existsSync(browserDistFolder));
if (fs.existsSync(browserDistFolder)) {
  console.log('Browser folder contents:', fs.readdirSync(browserDistFolder));
}

const app = express();
const angularApp = new AngularNodeAppEngine();

// Test endpoint to check server status
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running',
    serverPath: serverDistFolder,
    browserPath: browserDistFolder,
    currentDir: process.cwd(),
    environment: process.env['NODE_ENV'],
  });
});

// Log all requests to see what's being requested
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  console.log(`Handling route: ${req.originalUrl}`);
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        console.log('✅ Response found, writing to response');
        return writeResponseToNodeResponse(response, res);
      } else {
        console.log('❌ No response found, moving to next handler');
        return next();
      }
    })
    .catch((err) => {
      console.error('❌ Error handling request:', err);
      next(err);
    });
});

// Fallback route handler for debugging
app.use((req, res) => {
  console.log(`❌ No route matched for: ${req.originalUrl}`);
  res.status(404).send(`Not found: ${req.originalUrl}`);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on port 3000 for Hostinger compatibility.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 3000; // Set default to 3000 for Hostinger
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
