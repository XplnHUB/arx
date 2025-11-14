class Router {
  constructor() {
    this.routes = [];
    this.corsOptions = {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: [],
      credentials: false,
      maxAge: 86400
    };
  }

  addRoute(method, path, ...handlers) {
    const route = {
      method: method.toUpperCase(),
      path,
      regex: this._pathToRegex(path),
      paramNames: this._extractParamNames(path),
      handlers: handlers
    };
    this.routes.push(route);
  }

  match(method, url) {
    const [path, queryString] = url.split('?');
    const query = this._parseQuery(queryString);
    const upperMethod = method.toUpperCase();

    // Handle OPTIONS for CORS preflight
    if (upperMethod === 'OPTIONS') {
      return {
        method: 'OPTIONS',
        path,
        handle: (req, res) => {
          this._setCorsHeaders(res);
          res.statusCode = 204; // No Content
          res.end();
        }
      };
    }

    for (const route of this.routes) {
      // Support for HEAD by reusing GET handlers
      if (upperMethod === 'HEAD' && route.method === 'GET') {
        const match = path.match(route.regex);
        if (!match) continue;

        const params = this._extractParams(route.paramNames, match);
        
        return {
          ...route,
          method: 'HEAD', // Override method for handler
          params,
          query,
          handle: (req, res) => {
            req.params = params;
            req.query = query;
            // Set CORS headers
            this._setCorsHeaders(res);
            // For HEAD requests, we run the GET handlers but don't send the body
            const originalEnd = res.end;
            res.end = function() {
              res.end = originalEnd;
              res.end(); // End without body
            };
            this._runHandlers(route.handlers, req, res);
          }
        };
      }

      // Normal route matching
      if (route.method !== upperMethod) continue;

      const match = path.match(route.regex);
      if (!match) continue;

      const params = this._extractParams(route.paramNames, match);
      
      return {
        ...route,
        params,
        query,
        handle: (req, res) => {
          req.params = params;
          req.query = query;
          // Set CORS headers for all responses
          this._setCorsHeaders(res);
          this._runHandlers(route.handlers, req, res);
        }
      };
    }
    return null;
  }

  _pathToRegex(path) {
    // Convert route path to regex pattern
    const pattern = path
      .replace(/\*/g, '.*') // wildcard support
      .replace(/:([^\/]+)/g, '([^\/]+)'); // parameter support
    return new RegExp(`^${pattern}$`);
  }

  _extractParamNames(path) {
    const paramNames = [];
    path.replace(/:([^\/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
    });
    return paramNames;
  }

  _extractParams(paramNames, match) {
    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });
    return params;
  }

  _parseQuery(queryString) {
    if (!queryString) return {};
    
    return queryString.split('&').reduce((query, pair) => {
      const [key, value] = pair.split('=');
      if (key) {
        query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : true;
      }
      return query;
    }, {});
  }

  // Set CORS headers based on configuration
  _setCorsHeaders(res) {
    const { origin, methods, allowedHeaders, exposedHeaders, credentials, maxAge } = this.corsOptions;
    
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    if (credentials) res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (exposedHeaders.length) {
      res.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(','));
    }
    
    // For preflight requests
    if (methods.length) {
      res.setHeader('Access-Control-Allow-Methods', methods.join(','));
    }
    if (allowedHeaders.length) {
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(','));
    }
    if (maxAge) {
      res.setHeader('Access-Control-Max-Age', maxAge);
    }
  }

  // Configure CORS options
  cors(options = {}) {
    this.corsOptions = { ...this.corsOptions, ...options };
    return this;
  }

  _runHandlers(handlers, req, res, index = 0) {
    if (index >= handlers.length) return;

    const next = (err) => {
      if (err) {
        // Error handling middleware
        const errorHandler = handlers.find(h => h.length === 4);
        if (errorHandler) return errorHandler(err, req, res, () => {});
        throw err;
      }
      this._runHandlers(handlers, req, res, index + 1);
    };

    const handler = handlers[index];
    if (handler.length <= 3) {
      // Regular middleware or route handler (req, res, next)
      return handler(req, res, next);
    }
    next(); // Skip error handlers unless there's an error
  }
}

export default Router;