# ARX API Documentation

Complete API reference for the ARX multi-format backend framework.

## Table of Contents

- [App](#app)
- [Request](#request)
- [Response](#response)
- [Routing](#routing)
- [Middleware](#middleware)
- [Parsers](#parsers)
- [Utilities](#utilities)

---

## App

The main application class for creating an ARX server.

### Constructor

```javascript
import App from 'arx';

const app = new App();
```

### Methods

#### `get(path, ...handlers)`

Register a GET route.

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});
```

#### `post(path, ...handlers)`

Register a POST route.

```javascript
app.post('/users', (req, res) => {
  res.status(201).json({ created: true });
});
```

#### `put(path, ...handlers)`

Register a PUT route.

```javascript
app.put('/users/:id', (req, res) => {
  res.json({ updated: true });
});
```

#### `delete(path, ...handlers)`

Register a DELETE route.

```javascript
app.delete('/users/:id', (req, res) => {
  res.json({ deleted: true });
});
```

#### `patch(path, ...handlers)`

Register a PATCH route.

```javascript
app.patch('/users/:id', (req, res) => {
  res.json({ patched: true });
});
```

#### `use(middleware)`

Register global middleware.

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

Path-specific middleware:

```javascript
app.use('/admin', (req, res, next) => {
  // Only runs for /admin/* routes
  next();
});
```

#### `useError(handler)`

Register error handling middleware.

```javascript
app.useError((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

#### `cors(options)`

Configure CORS settings.

```javascript
app.cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
});
```

#### `onShutdown(hook)`

Register a shutdown hook.

```javascript
app.onShutdown(async () => {
  // Cleanup code
  console.log('Shutting down...');
});
```

#### `listen(port, callback)`

Start the server.

```javascript
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### `shutdown()`

Gracefully shutdown the server.

```javascript
await app.shutdown();
```

---

## Request

The request object with parsed body and parameters.

### Properties

#### `req.body`

Parsed request body based on content type.

```javascript
app.post('/data', (req, res) => {
  console.log(req.body); // { name: 'John', age: 30 }
});
```

#### `req.bodyType`

Type of parsed body: `'json'`, `'csv'`, `'xml'`, `'yaml'`, `'formdata'`, `'binary'`, or `null`.

```javascript
app.post('/data', (req, res) => {
  if (req.bodyType === 'json') {
    // Handle JSON
  }
});
```

#### `req.params`

Route parameters extracted from URL.

```javascript
app.get('/users/:id/posts/:postId', (req, res) => {
  console.log(req.params); // { id: '123', postId: '456' }
});
```

#### `req.query`

Query string parameters.

```javascript
app.get('/search', (req, res) => {
  console.log(req.query); // { q: 'test', limit: '10' }
});
```

---

## Response

Enhanced response object with helper methods.

### Methods

#### `res.status(code)`

Set HTTP status code. Returns response for chaining.

```javascript
res.status(201).json({ created: true });
```

#### `res.set(header, value)`

Set response header. Returns response for chaining.

```javascript
res.set('X-Custom-Header', 'value').json({ ok: true });
```

#### `res.json(data)`

Send JSON response.

```javascript
res.json({ message: 'Hello' });
```

#### `res.send(data)`

Send plain text or buffer response.

```javascript
res.send('Hello World');
```

#### `res.csv(data)`

Send CSV response.

```javascript
res.csv('name,age\nJohn,30\nJane,25');
```

#### `res.xml(data)`

Send XML response.

```javascript
res.xml('<?xml version="1.0"?><root><name>test</name></root>');
```

#### `res.yaml(data)`

Send YAML response.

```javascript
res.yaml('name: test\nvalue: 123');
```

#### `res.file(buffer, mimetype)`

Send binary file response.

```javascript
const buffer = fs.readFileSync('image.png');
res.file(buffer, 'image/png');
```

#### `res.error(options)`

Send error response.

```javascript
res.error({
  message: 'Not found',
  code: 404,
  details: { resource: 'user' }
});
```

#### `res.stream(readableStream)`

Pipe a readable stream to response.

```javascript
const stream = fs.createReadStream('large-file.txt');
res.stream(stream);
```

#### `res.download(filePath, filename)`

Send file as download.

```javascript
res.download('/path/to/file.pdf', 'document.pdf');
```

---

## Routing

### Route Parameters

Extract dynamic values from URL paths.

```javascript
app.get('/users/:id', (req, res) => {
  res.json({ userId: req.params.id });
});

// GET /users/123 → { userId: '123' }
```

### Wildcard Routes

Match any path segment.

```javascript
app.get('/files/*', (req, res) => {
  res.json({ path: req.url });
});

// GET /files/documents/file.txt → matches
```

### Query Strings

Access query parameters.

```javascript
app.get('/search', (req, res) => {
  const { q, limit } = req.query;
  res.json({ query: q, limit });
});

// GET /search?q=test&limit=10 → { query: 'test', limit: '10' }
```

### Multiple Parameters

Combine multiple route parameters.

```javascript
app.get('/users/:userId/posts/:postId', (req, res) => {
  res.json(req.params);
});

// GET /users/42/posts/99 → { userId: '42', postId: '99' }
```

---

## Middleware

### Global Middleware

Runs for all requests.

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### Path-Specific Middleware

Runs only for matching paths.

```javascript
app.use('/admin', (req, res, next) => {
  // Verify admin access
  next();
});
```

### Route-Level Middleware

Runs for specific routes.

```javascript
app.get(
  '/protected',
  (req, res, next) => {
    // Authentication middleware
    next();
  },
  (req, res) => {
    res.json({ protected: true });
  }
);
```

### Async Middleware

Support for async operations.

```javascript
app.use(async (req, res, next) => {
  await database.connect();
  next();
});
```

### Error Handling Middleware

Handle errors from routes and middleware.

```javascript
app.useError((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});
```

---

## Parsers

### JSON Parser

```javascript
// Automatic parsing for Content-Type: application/json
app.post('/data', (req, res) => {
  console.log(req.body); // Parsed JSON object
});
```

Error handling:

```javascript
try {
  const data = parseJSON(buffer);
} catch (err) {
  console.error(err.message); // "Invalid JSON: ..."
  console.error(err.statusCode); // 400
}
```

### CSV Parser

```javascript
// Automatic parsing for Content-Type: text/csv
app.post('/data', (req, res) => {
  console.log(req.body); // Array of objects
});
```

Options:

```javascript
const options = {
  headers: true,        // Use first row as headers (default: true)
  delimiter: ',',       // Field delimiter (default: ',')
  skipEmptyLines: true, // Skip empty lines (default: true)
  schema: {             // Optional schema validation
    age: (val) => !isNaN(parseInt(val))
  }
};
```

### XML Parser

```javascript
// Automatic parsing for Content-Type: application/xml
app.post('/data', (req, res) => {
  console.log(req.body); // Parsed XML object
});
```

Options:

```javascript
const options = {
  safeMode: true,  // Disable external entities (default: true)
  strict: true     // Strict parsing mode (default: true)
};
```

### YAML Parser

```javascript
// Automatic parsing for Content-Type: application/x-yaml
app.post('/data', (req, res) => {
  console.log(req.body); // Parsed YAML object
});
```

Options:

```javascript
const options = {
  multiDoc: false  // Parse multiple documents (default: false)
};
```

### Form-Data Parser

```javascript
// Automatic parsing for Content-Type: multipart/form-data
app.post('/upload', (req, res) => {
  console.log(req.body.fields);  // Form fields
  console.log(req.body.files);   // Uploaded files
});
```

Options:

```javascript
const options = {
  fileSizeLimit: 10 * 1024 * 1024,  // 10MB (default)
  memoryLimit: 50 * 1024 * 1024,    // 50MB (default)
  fileCountLimit: 10                 // Max files (default)
};
```

File structure:

```javascript
{
  fields: {
    name: 'John',
    email: 'john@example.com'
  },
  files: {
    avatar: {
      filename: 'avatar.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 12345,
      buffer: <Buffer>
    }
  }
}
```

---

## Utilities

### URL Parser

Parse and extract URL components.

```javascript
import parseURL from 'arx/utils/urlParser.js';

const parsed = parseURL('/search?q=test#results');
// {
//   protocol: 'http',
//   hostname: 'localhost',
//   port: 80,
//   pathname: '/search',
//   search: '?q=test',
//   hash: '#results',
//   query: { q: 'test' },
//   href: 'http://localhost/search?q=test#results',
//   origin: 'http://localhost'
// }
```

### Deep Merge

Recursively merge objects.

```javascript
import deepMerge from 'arx/utils/deepMerge.js';

const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { b: { d: 3 }, e: 4 };

const merged = deepMerge(obj1, obj2);
// { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

---

## Examples

### Basic Server

```javascript
import App from 'arx';

const app = new App();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### REST API

```javascript
import App from 'arx';

const app = new App();
const users = [];

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).json(user);
});

app.get('/users/:id', (req, res) => {
  const user = users[req.params.id];
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(3000);
```

### Multi-Format API

```javascript
import App from 'arx';

const app = new App();

app.post('/data', (req, res) => {
  switch (req.bodyType) {
    case 'json':
      res.json({ received: 'json', data: req.body });
      break;
    case 'csv':
      res.json({ received: 'csv', records: req.body.length });
      break;
    case 'xml':
      res.json({ received: 'xml', root: Object.keys(req.body)[0] });
      break;
    default:
      res.status(400).json({ error: 'Unsupported format' });
  }
});

app.listen(3000);
```

### With Middleware

```javascript
import App from 'arx';

const app = new App();

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
app.use('/admin', (req, res, next) => {
  const token = req.headers.authorization;
  if (token === 'Bearer secret') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/admin/stats', (req, res) => {
  res.json({ users: 100, posts: 500 });
});

app.listen(3000);
```
