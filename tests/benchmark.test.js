import { describe, it, expect } from 'vitest';
import App from '../src/index.js';
import http from 'http';

describe('Performance Benchmarks', () => {
  let app;
  let server;

  const makeRequest = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3335,
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

  it('should handle 100 sequential requests in < 5 seconds', async () => {
    app = new App();

    app.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const start = Date.now();

    for (let i = 0; i < 100; i++) {
      await makeRequest('GET', '/test');
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);

    server.close();
  });

  it('should parse JSON efficiently', async () => {
    app = new App();

    app.post('/json', (req, res) => {
      res.json({ received: req.body });
    });

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const testData = { name: 'test', value: 123, nested: { key: 'value' } };
    const start = Date.now();

    for (let i = 0; i < 50; i++) {
      await makeRequest('POST', '/json', testData);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);

    server.close();
  });

  it('should handle middleware chain efficiently', async () => {
    app = new App();

    // Add multiple middleware
    for (let i = 0; i < 5; i++) {
      app.use((req, res, next) => {
        next();
      });
    }

    app.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const start = Date.now();

    for (let i = 0; i < 50; i++) {
      await makeRequest('GET', '/test');
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);

    server.close();
  });

  it('should handle route matching efficiently', async () => {
    app = new App();

    // Register many routes
    for (let i = 0; i < 20; i++) {
      app.get(`/route${i}`, (req, res) => {
        res.json({ route: i });
      });
    }

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const start = Date.now();

    for (let i = 0; i < 50; i++) {
      const route = i % 20;
      await makeRequest('GET', `/route${route}`);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);

    server.close();
  });

  it('should handle route parameters efficiently', async () => {
    app = new App();

    app.get('/users/:id/posts/:postId', (req, res) => {
      res.json({ userId: req.params.id, postId: req.params.postId });
    });

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const start = Date.now();

    for (let i = 0; i < 50; i++) {
      await makeRequest('GET', `/users/${i}/posts/${i * 2}`);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);

    server.close();
  });

  it('should handle query strings efficiently', async () => {
    app = new App();

    app.get('/search', (req, res) => {
      res.json({ query: req.query });
    });

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const start = Date.now();

    for (let i = 0; i < 50; i++) {
      await makeRequest('GET', `/search?q=test${i}&limit=10&offset=${i * 10}`);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);

    server.close();
  });

  it('should handle error responses efficiently', async () => {
    app = new App();

    app.get('/error', (req, res) => {
      res.status(400).error({ message: 'Bad request', code: 400 });
    });

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const start = Date.now();

    for (let i = 0; i < 50; i++) {
      await makeRequest('GET', '/error');
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);

    server.close();
  });

  it('should handle async middleware efficiently', async () => {
    app = new App();

    app.use(async (req, res, next) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      next();
    });

    app.get('/test', (req, res) => {
      res.json({ ok: true });
    });

    server = app.listen(3335);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const start = Date.now();

    for (let i = 0; i < 20; i++) {
      await makeRequest('GET', '/test');
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);

    server.close();
  });
});
