# ARX Troubleshooting Guide

Common issues and solutions when using the ARX framework.

## Table of Contents

- [Parser Issues](#parser-issues)
- [Routing Issues](#routing-issues)
- [Middleware Issues](#middleware-issues)
- [Response Issues](#response-issues)
- [Performance Issues](#performance-issues)
- [Error Messages](#error-messages)

---

## Parser Issues

### Invalid JSON Error

**Problem**: `Invalid JSON: Unexpected token`

**Causes**:
- Malformed JSON in request body
- Missing or incorrect Content-Type header
- Empty request body

**Solution**:

```javascript
// Verify Content-Type header
app.post('/data', (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).error({
      message: 'Content-Type must be application/json',
      code: 400
    });
  }

  // Verify body is not empty
  if (!req.body) {
    return res.status(400).error({
      message: 'Request body is empty',
      code: 400
    });
  }

  res.json(req.body);
});
```

### Invalid CSV Error

**Problem**: `Invalid CSV: Error parsing CSV`

**Causes**:
- Mismatched delimiters
- Unclosed quoted fields
- Invalid schema validation

**Solution**:

```javascript
// Specify correct delimiter
app.post('/csv', (req, res) => {
  try {
    // Try with semicolon delimiter
    const data = parseCSV(req.body, { delimiter: ';' });
    res.json({ records: data.length });
  } catch (err) {
    res.status(400).error({
      message: 'CSV parsing failed',
      code: 400,
      details: { error: err.message }
    });
  }
});
```

### Invalid XML Error

**Problem**: `Invalid XML: Unexpected end of input`

**Causes**:
- Unclosed XML tags
- Invalid XML declaration
- Malformed attributes

**Solution**:

```javascript
// Validate XML structure
app.post('/xml', (req, res) => {
  try {
    // Check if XML is well-formed
    if (!req.body.trim().startsWith('<?xml')) {
      // Add XML declaration if missing
      const xmlString = `<?xml version="1.0"?>${req.body}`;
      // Parse with corrected XML
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).error({
      message: 'XML parsing failed',
      code: 400,
      details: { error: err.message }
    });
  }
});
```

### Invalid YAML Error

**Problem**: `Invalid YAML: Implicit keys need to be on a single line`

**Causes**:
- Incorrect indentation
- Invalid key-value syntax
- Unclosed quotes

**Solution**:

```javascript
// Validate YAML syntax
app.post('/yaml', (req, res) => {
  try {
    // Check indentation (should be 2 or 4 spaces)
    const lines = req.body.split('\n');
    for (const line of lines) {
      const indent = line.match(/^(\s*)/)[1].length;
      if (indent % 2 !== 0) {
        throw new Error('Invalid indentation');
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).error({
      message: 'YAML parsing failed',
      code: 400,
      details: { error: err.message }
    });
  }
});
```

### File Upload Size Exceeded

**Problem**: `File size exceeds limit`

**Causes**:
- File larger than configured limit
- Multiple files exceeding total memory limit

**Solution**:

```javascript
// Increase limits if needed
const parseFormData = require('arx/src/parsers/formdata.js');

app.post('/upload', (req, res) => {
  try {
    const data = parseFormData(req, {
      fileSizeLimit: 50 * 1024 * 1024,    // 50MB per file
      memoryLimit: 200 * 1024 * 1024,     // 200MB total
      fileCountLimit: 20                   // 20 files max
    });
    res.json({ success: true });
  } catch (err) {
    res.status(413).error({
      message: 'File too large',
      code: 413,
      details: { error: err.message }
    });
  }
});
```

---

## Routing Issues

### Route Not Matching

**Problem**: Getting 404 for a route that should exist

**Causes**:
- Route registered after request
- Incorrect path pattern
- Method mismatch (GET vs POST)

**Solution**:

```javascript
// Register routes before starting server
const app = new App();

// Register all routes FIRST
app.get('/users', (req, res) => res.json([]));
app.get('/users/:id', (req, res) => res.json({ id: req.params.id }));

// THEN start server
app.listen(3000);

// Debug: Log all registered routes
app.router.routes.forEach(route => {
  console.log(`${route.method} ${route.path}`);
});
```

### Route Parameters Not Extracting

**Problem**: `req.params` is empty or undefined

**Causes**:
- Parameter name mismatch
- Route pattern incorrect

**Solution**:

```javascript
// Correct: Parameter name matches route
app.get('/users/:userId', (req, res) => {
  console.log(req.params.userId); // Works
  res.json({ id: req.params.userId });
});

// Wrong: Parameter name doesn't match
app.get('/users/:id', (req, res) => {
  console.log(req.params.userId); // undefined
});
```

### Query String Not Parsing

**Problem**: `req.query` is empty

**Causes**:
- No query string in URL
- Incorrect URL format

**Solution**:

```javascript
// Correct URL format
app.get('/search', (req, res) => {
  console.log(req.query); // { q: 'test', limit: '10' }
  res.json(req.query);
});

// Usage: GET /search?q=test&limit=10
```

### Wildcard Routes Matching Everything

**Problem**: Wildcard route matches unintended paths

**Causes**:
- Wildcard route registered before specific routes
- Incorrect route ordering

**Solution**:

```javascript
// Register specific routes BEFORE wildcard routes
app.get('/files/special', (req, res) => {
  res.json({ special: true });
});

// Wildcard route AFTER specific routes
app.get('/files/*', (req, res) => {
  res.json({ path: req.url });
});

// Now /files/special matches first route
// And /files/other matches wildcard route
```

---

## Middleware Issues

### Middleware Not Executing

**Problem**: Middleware code never runs

**Causes**:
- `next()` not called in previous middleware
- Route handler sends response before middleware
- Middleware registered after route

**Solution**:

```javascript
// Register middleware BEFORE routes
app.use((req, res, next) => {
  console.log('This runs first');
  next(); // MUST call next()
});

// THEN register routes
app.get('/', (req, res) => {
  res.json({ ok: true });
});

// NOT this order:
app.get('/', (req, res) => res.json({}));
app.use((req, res, next) => {}); // Won't run for existing routes
```

### Async Middleware Not Awaiting

**Problem**: Route executes before async middleware completes

**Causes**:
- Not awaiting async operation
- Not returning promise

**Solution**:

```javascript
// Correct: Return promise or use async/await
app.use(async (req, res, next) => {
  await database.connect();
  next();
});

// Also correct:
app.use((req, res, next) => {
  return database.connect().then(() => next());
});

// Wrong: Not returning promise
app.use((req, res, next) => {
  database.connect(); // Fire and forget
  next(); // Runs immediately
});
```

### Error Middleware Not Catching Errors

**Problem**: Error handler doesn't execute

**Causes**:
- Error handler registered before routes
- Error not passed to `next()`
- Response already sent

**Solution**:

```javascript
// Register routes FIRST
app.get('/data', (req, res, next) => {
  try {
    const data = JSON.parse(req.body);
    res.json(data);
  } catch (err) {
    next(err); // Pass error to next middleware
  }
});

// Error handler LAST
app.useError((err, req, res, next) => {
  res.status(500).error({
    message: err.message,
    code: 500
  });
});
```

---

## Response Issues

### Response Headers Already Sent

**Problem**: `Error: Can't set headers after they are sent to the client`

**Causes**:
- Calling `res.json()` or `res.send()` twice
- Setting headers after response sent

**Solution**:

```javascript
// Wrong: Multiple responses
app.get('/', (req, res) => {
  res.json({ ok: true });
  res.json({ ok: false }); // Error!
});

// Correct: Single response
app.get('/', (req, res) => {
  if (someCondition) {
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

// Also correct: Use return to exit early
app.get('/', (req, res) => {
  if (someCondition) {
    return res.json({ ok: true });
  }
  res.json({ ok: false });
});
```

### Content-Type Not Set

**Problem**: Response has wrong content type

**Causes**:
- Using wrong response method
- Not setting content type manually

**Solution**:

```javascript
// Use correct response method
app.get('/json', (req, res) => {
  res.json({ data: 'value' }); // Sets application/json
});

app.get('/csv', (req, res) => {
  res.csv('a,b,c\n1,2,3'); // Sets text/csv
});

// Or set manually
app.get('/custom', (req, res) => {
  res.set('Content-Type', 'application/custom');
  res.send(data);
});
```

### Download Not Working

**Problem**: File not downloading or corrupted

**Causes**:
- File path incorrect
- File doesn't exist
- Wrong MIME type

**Solution**:

```javascript
import fs from 'fs';
import path from 'path';

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Validate filename
  if (filename.includes('..')) {
    return res.status(400).error({
      message: 'Invalid filename',
      code: 400
    });
  }

  const filepath = path.join('/safe/directory', filename);

  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).error({
      message: 'File not found',
      code: 404
    });
  }

  // Use download with correct MIME type
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.txt': 'text/plain'
  };

  const ext = path.extname(filename);
  const mimetype = mimeTypes[ext] || 'application/octet-stream';

  res.download(filepath, filename);
});
```

---

## Performance Issues

### Slow Request Processing

**Problem**: Requests taking too long

**Causes**:
- Synchronous operations in middleware
- Large file uploads
- Inefficient parsing

**Solution**:

```javascript
// Use async operations
app.use(async (req, res, next) => {
  // Good: Async database query
  const user = await database.findUser(req.userId);
  req.user = user;
  next();
});

// Bad: Synchronous blocking operation
app.use((req, res, next) => {
  const user = database.findUserSync(req.userId); // Blocks!
  req.user = user;
  next();
});

// Stream large files instead of buffering
app.get('/large-file', (req, res) => {
  const stream = fs.createReadStream('/path/to/large/file');
  res.stream(stream); // Good
  
  // Not this:
  const buffer = fs.readFileSync('/path/to/large/file');
  res.send(buffer); // Bad - loads entire file in memory
});
```

### High Memory Usage

**Problem**: Memory usage grows over time

**Causes**:
- Large file uploads not cleaned up
- Memory leaks in middleware
- Unbounded caches

**Solution**:

```javascript
// Limit file upload sizes
app.post('/upload', (req, res) => {
  const options = {
    fileSizeLimit: 10 * 1024 * 1024,    // 10MB
    memoryLimit: 50 * 1024 * 1024,      // 50MB
    fileCountLimit: 5
  };
  // Use options when parsing
});

// Clean up resources
app.onShutdown(async () => {
  // Close database connections
  await database.close();
  
  // Clean up temporary files
  fs.rmSync('/tmp/uploads', { recursive: true });
});

// Use bounded caches
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

function cacheSet(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}
```

---

## Error Messages

### "Cannot find module 'arx'"

**Solution**:
```bash
npm install arx
```

### "Port already in use"

**Problem**: Another process using the port

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
app.listen(3001);
```

### "EACCES: permission denied"

**Problem**: No permission to access file

**Solution**:
```bash
# Fix file permissions
chmod 644 /path/to/file

# Or run with appropriate permissions
sudo node app.js
```

### "ENOENT: no such file or directory"

**Problem**: File or directory doesn't exist

**Solution**:
```javascript
import fs from 'fs';
import path from 'path';

// Check if file exists before accessing
if (!fs.existsSync(filepath)) {
  return res.status(404).error({
    message: 'File not found',
    code: 404
  });
}

// Create directory if needed
const dir = path.dirname(filepath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}
```

---

## Getting Help

If you encounter issues not covered here:

1. Check the [API Documentation](./api.md)
2. Review [Architecture Overview](./architecture.md)
3. Check [Security Practices](./security.md)
4. Open an issue on [GitHub](https://github.com/XplnHUB/arx/issues)
5. Check existing issues for similar problems

---

## Debugging Tips

### Enable Verbose Logging

```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Log all responses
app.use((req, res, next) => {
  const originalEnd = res.end;
  res.end = function(...args) {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', res.getHeaders());
    originalEnd.apply(res, args);
  };
  next();
});
```

### Use Node.js Debugger

```bash
node --inspect app.js
```

Then open `chrome://inspect` in Chrome DevTools.

### Add Request ID for Tracing

```javascript
import crypto from 'crypto';

app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.set('X-Request-ID', req.id);
  console.log(`[${req.id}] ${req.method} ${req.url}`);
  next();
});
```
