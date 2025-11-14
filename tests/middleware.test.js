import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../src/index.js';
import http from 'http';

describe('Middleware', () => {
  let app;
  let server;

  beforeEach(() => {
    app = new App();
  });

  afterEach(() => {
    if (server) {
      return new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  const makeRequest = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3334,
        path,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  it('should execute global middleware', async () => {
    let middlewareExecuted = false;

    app.use((req, res, next) => {
      middlewareExecuted = true;
      next();
    });

    app.get('/test', (req, res) => {
      res.json({ executed: middlewareExecuted });
    });

    server = app.listen(3334);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/test');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).executed).toBe(true);
  });

  it('should execute multiple middleware in order', async () => {
    const order = [];

    app.use((req, res, next) => {
      order.push(1);
      next();
    });

    app.use((req, res, next) => {
      order.push(2);
      next();
    });

    app.get('/test', (req, res) => {
      res.json({ order });
    });

    server = app.listen(3334);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/test');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).order).toEqual([1, 2]);
  });

  it('should support async middleware', async () => {
    app.use(async (req, res, next) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      next();
    });

    app.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    server = app.listen(3334);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/test');
    expect(response.statusCode).toBe(200);
  });

  it('should allow middleware to modify request', async () => {
    app.use((req, res, next) => {
      req.customData = 'modified';
      next();
    });

    app.get('/test', (req, res) => {
      res.json({ customData: req.customData });
    });

    server = app.listen(3334);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/test');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).customData).toBe('modified');
  });

  it('should support route-level middleware', async () => {
    app.get(
      '/test',
      (req, res, next) => {
        req.middleware = 'applied';
        next();
      },
      (req, res) => {
        res.json({ middleware: req.middleware });
      }
    );

    server = app.listen(3334);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/test');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).middleware).toBe('applied');
  });

  it('should handle middleware errors', async () => {
    app.use((req, res, next) => {
      next(new Error('Middleware error'));
    });

    app.useError((err, req, res, next) => {
      res.status(500).json({ error: err.message });
    });

    app.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    server = app.listen(3334);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/test');
    expect(response.statusCode).toBe(500);
  });

  it('should skip middleware for non-matching paths', async () => {
    let middlewareExecuted = false;

    app.use('/admin', (req, res, next) => {
      middlewareExecuted = true;
      next();
    });

    app.get('/test', (req, res) => {
      res.json({ executed: middlewareExecuted });
    });

    server = app.listen(3334);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/test');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).executed).toBe(false);
  });
});
