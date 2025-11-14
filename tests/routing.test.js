import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../src/index.js';
import http from 'http';

describe('Routing', () => {
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
        port: 3333,
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

  it('should match basic GET route', async () => {
    app.get('/hello', (req, res) => {
      res.json({ message: 'Hello' });
    });

    server = app.listen(3333);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/hello');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: 'Hello' });
  });

  it('should match route with parameters', async () => {
    app.get('/user/:id', (req, res) => {
      res.json({ userId: req.params.id });
    });

    server = app.listen(3333);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/user/123');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ userId: '123' });
  });

  it('should match wildcard routes', async () => {
    app.get('/files/*', (req, res) => {
      res.json({ path: req.url });
    });

    server = app.listen(3333);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/files/documents/file.txt');
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.path).toContain('/files/');
  });

  it('should parse query strings', async () => {
    app.get('/search', (req, res) => {
      res.json({ query: req.query });
    });

    server = app.listen(3333);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/search?q=test&limit=10');
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.query.q).toBe('test');
    expect(body.query.limit).toBe('10');
  });

  it('should handle POST requests', async () => {
    app.post('/data', (req, res) => {
      res.json({ received: req.body });
    });

    server = app.listen(3333);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('POST', '/data', { name: 'test' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ received: { name: 'test' } });
  });

  it('should return 404 for unmatched routes', async () => {
    app.get('/exists', (req, res) => {
      res.json({ ok: true });
    });

    server = app.listen(3333);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/notfound');
    expect(response.statusCode).toBe(404);
  });

  it('should support multiple route parameters', async () => {
    app.get('/user/:userId/post/:postId', (req, res) => {
      res.json({ userId: req.params.userId, postId: req.params.postId });
    });

    server = app.listen(3333);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await makeRequest('GET', '/user/42/post/99');
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ userId: '42', postId: '99' });
  });
});
