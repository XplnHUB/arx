import http from 'http';
import parseRequest from '../parsers/index.js';
import enhanceResponse from '../response/enhance.js';
import runMiddleware from './middleware.js';

// Global error handler
const handleError = (err, req, res) => {
  if (!res.headersSent) {
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message || 'Internal Server Error';
    
    res.statusCode = statusCode;
    
    // Try to send JSON if possible
    if (req.headers.accept?.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: true, 
        status: statusCode,
        message 
      }));
    } else {
      res.end(message);
    }
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Consider restarting the process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

function createServer(app) {
  const server = http.createServer(async (req, res) => {
    try {
      await parseRequest(req);
      enhanceResponse(res);
      
      // Add error handler to response
      res.on('error', (err) => {
        handleError(err, req, res);
      });
      
      // Apply global middleware first
      await runMiddleware(app.middlewares, req, res, async (err) => {
        if (err) {
          return handleError(err, req, res);
        }
        
        try {
          const route = app.router.match(req.method, req.url);
          
          if (route) {
            // Apply route-specific middleware and handlers
            await new Promise((resolve) => {
              const done = (err) => {
                if (err) handleError(err, req, res);
                resolve();
              };
              route.handle(req, res, done);
            });
          } else {
            // No route matched
            res.statusCode = 404;
            res.end('Not Found');
          }
        } catch (err) {
          handleError(err, req, res);
        }
      });
    } catch (err) {
      handleError(err, req, res);
    }
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  return server;
}

export default createServer;