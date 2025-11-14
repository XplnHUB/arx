import Router from './router.js';
import createServer from './server.js';

class App {
  constructor() {
    this.router = new Router();
    this.middlewares = [];
    this.shutdownHooks = [];
    this.server = null;
  }

  // Route with middleware support
  _register(method, path, ...handlers) {
    this.router.addRoute(method, path, ...handlers);
  }

  // HTTP method handlers with middleware support
  get(path, ...handlers) {
    this._register('GET', path, ...handlers);
  }

  post(path, ...handlers) {
    this._register('POST', path, ...handlers);
  }

  put(path, ...handlers) {
    this._register('PUT', path, ...handlers);
  }

  delete(path, ...handlers) {
    this._register('DELETE', path, ...handlers);
  }

  patch(path, ...handlers) {
    this._register('PATCH', path, ...handlers);
  }

  // Global middleware
  use(middleware) {
    if (typeof middleware === 'function') {
      this.middlewares.push(middleware);
    } else if (typeof middleware === 'string') {
      // Path-specific middleware: app.use('/path', middleware)
      const path = middleware;
      return (...middlewareFns) => {
        middlewareFns.forEach(fn => {
          this.middlewares.push((req, res, next) => {
            if (req.url.startsWith(path)) {
              fn(req, res, next);
            } else {
              next();
            }
          });
        });
      };
    }
    return this;
  }

  // Error handling middleware
  useError(handler) {
    this.middlewares.push((err, req, res, next) => {
      handler(err, req, res, next);
    });
  }

  // Configure CORS options
  cors(options) {
    this.router.cors(options);
    return this; // For chaining
  }

  // Add a shutdown hook
  onShutdown(hook) {
    if (typeof hook === 'function') {
      this.shutdownHooks.push(hook);
    }
    return this; // For chaining
  }

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down gracefully...');
    
    // Run all shutdown hooks
    for (const hook of this.shutdownHooks) {
      try {
        await Promise.resolve(hook());
      } catch (err) {
        console.error('Error in shutdown hook:', err);
      }
    }

    // Close the server if it's running
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('Server has been closed');
          this.server = null;
          resolve();
        });

        // Force close after timeout
        setTimeout(() => {
          console.log('Forcing server close');
          process.exit(1);
        }, 10000).unref();
      });
    }
  }

  listen(port, callback) {
    this.server = createServer(this);
    
    // Handle process termination
    const shutdownSignals = ['SIGINT', 'SIGTERM'];
    const onSignal = async (signal) => {
      console.log(`Received ${signal}, shutting down...`);
      try {
        await this.shutdown();
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    // Set up signal handlers
    shutdownSignals.forEach(signal => {
      process.on(signal, onSignal);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (err) => {
      console.error('Uncaught Exception:', err);
      try {
        await this.shutdown();
      } finally {
        process.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    return this.server.listen(port, callback);
  }
}

export default App;