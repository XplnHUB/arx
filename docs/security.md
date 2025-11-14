# ARX Security Practices

This guide covers security best practices when using the ARX framework.

## Table of Contents

- [Input Validation](#input-validation)
- [File Upload Security](#file-upload-security)
- [XML Security](#xml-security)
- [CORS Configuration](#cors-configuration)
- [Error Handling](#error-handling)
- [Middleware Security](#middleware-security)
- [Environment Variables](#environment-variables)
- [Common Vulnerabilities](#common-vulnerabilities)

---

## Input Validation

### Validate All User Input

Always validate and sanitize user input before processing:

```javascript
import App from 'arx';

const app = new App();

app.post('/users', (req, res) => {
  const { name, email, age } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).error({
      message: 'Missing required fields',
      code: 400,
      details: { required: ['name', 'email'] }
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).error({
      message: 'Invalid email format',
      code: 400
    });
  }

  // Validate age is a number
  if (age && isNaN(parseInt(age))) {
    return res.status(400).error({
      message: 'Age must be a number',
      code: 400
    });
  }

  // Process valid data
  res.json({ success: true, user: { name, email, age } });
});
```

### CSV Schema Validation

Use CSV schema validation to enforce data types:

```javascript
app.post('/import', (req, res) => {
  if (req.bodyType !== 'csv') {
    return res.status(400).error({
      message: 'Expected CSV format',
      code: 400
    });
  }

  // Validate CSV schema
  const schema = {
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    age: (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
    status: (val) => ['active', 'inactive'].includes(val)
  };

  try {
    const records = parseCSV(req.body, { schema });
    res.json({ imported: records.length });
  } catch (err) {
    res.status(400).error({
      message: 'CSV validation failed',
      code: 400,
      details: { error: err.message }
    });
  }
});
```

---

## File Upload Security

### Configure Upload Limits

Always set appropriate file upload limits:

```javascript
import App from 'arx';

const app = new App();

// Configure form-data parser with limits
const uploadOptions = {
  fileSizeLimit: 5 * 1024 * 1024,    // 5MB per file
  memoryLimit: 50 * 1024 * 1024,     // 50MB total
  fileCountLimit: 5                   // Max 5 files
};

app.post('/upload', (req, res) => {
  if (req.bodyType !== 'formdata') {
    return res.status(400).error({
      message: 'Expected form-data',
      code: 400
    });
  }

  const { fields, files } = req.body;

  // Validate file types
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  for (const [fieldname, file] of Object.entries(files)) {
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).error({
        message: `Invalid file type: ${file.mimetype}`,
        code: 400
      });
    }
  }

  res.json({ uploaded: Object.keys(files).length });
});
```

### Validate File Types

Check both MIME type and file extension:

```javascript
import path from 'path';

function validateFile(file) {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];

  // Check MIME type
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error(`Invalid MIME type: ${file.mimetype}`);
  }

  // Check file extension
  const ext = path.extname(file.filename).toLowerCase();
  if (!allowedExts.includes(ext)) {
    throw new Error(`Invalid file extension: ${ext}`);
  }

  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large');
  }

  return true;
}

app.post('/upload', (req, res) => {
  try {
    for (const file of Object.values(req.body.files)) {
      validateFile(file);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).error({
      message: err.message,
      code: 400
    });
  }
});
```

### Store Files Securely

Never store uploaded files in the web root:

```javascript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'private', 'uploads');

app.post('/upload', (req, res) => {
  const { files } = req.body;

  try {
    for (const [fieldname, file] of Object.entries(files)) {
      // Generate unique filename
      const hash = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.filename);
      const filename = `${hash}${ext}`;

      // Store in private directory
      const filepath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filepath, file.buffer);

      // Return reference ID, not direct path
      res.json({ fileId: hash });
    }
  } catch (err) {
    res.status(500).error({
      message: 'Upload failed',
      code: 500
    });
  }
});
```

---

## XML Security

### XXE Protection (Enabled by Default)

ARX enables XXE protection by default:

```javascript
// Safe by default - external entities disabled
app.post('/data', (req, res) => {
  if (req.bodyType === 'xml') {
    // External entities are already disabled
    res.json({ parsed: req.body });
  }
});
```

### Disable Safe Mode Only When Necessary

Only disable safe mode if you absolutely need it:

```javascript
import parseXML from 'arx/src/parsers/xml.js';

// NOT RECOMMENDED - Only use if you understand the risks
const xml = await parseXML(buffer, { safeMode: false });
```

### Validate XML Structure

Validate XML structure before processing:

```javascript
app.post('/xml-data', (req, res) => {
  if (req.bodyType !== 'xml') {
    return res.status(400).error({
      message: 'Expected XML format',
      code: 400
    });
  }

  try {
    const root = Object.keys(req.body)[0];
    
    // Validate expected root element
    if (root !== 'data') {
      throw new Error('Invalid root element');
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).error({
      message: 'XML validation failed',
      code: 400,
      details: { error: err.message }
    });
  }
});
```

---

## CORS Configuration

### Restrict Origins in Production

Always restrict CORS origins in production:

```javascript
import App from 'arx';

const app = new App();

// Development
if (process.env.NODE_ENV === 'development') {
  app.cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
} else {
  // Production - restrict to specific origins
  app.cors({
    origin: [
      'https://example.com',
      'https://app.example.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600
  });
}
```

### Validate Origin Header

Implement custom origin validation:

```javascript
const allowedOrigins = [
  'https://example.com',
  'https://app.example.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  next();
});
```

---

## Error Handling

### Hide Sensitive Information in Production

Never expose stack traces or internal details in production:

```javascript
app.useError((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    error: true,
    code: err.statusCode || 500,
    message: isDevelopment ? err.message : 'Internal Server Error'
  };

  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details;
  }

  res.status(errorResponse.code).json(errorResponse);
});
```

### Log Errors Securely

Log errors without exposing sensitive data:

```javascript
function logError(err, req) {
  const sanitized = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url,
    statusCode: err.statusCode || 500,
    message: err.message,
    // Don't log request body or sensitive headers
  };

  console.error(JSON.stringify(sanitized));
}

app.useError((err, req, res, next) => {
  logError(err, req);
  res.status(err.statusCode || 500).error({
    message: 'Internal Server Error',
    code: 500
  });
});
```

---

## Middleware Security

### Authentication Middleware

Implement authentication checks:

```javascript
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).error({
      message: 'Missing authorization token',
      code: 401
    });
  }

  try {
    // Verify token (example with JWT)
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).error({
      message: 'Invalid token',
      code: 401
    });
  }
}

app.use('/api', authMiddleware);
```

### Rate Limiting Middleware

Implement rate limiting to prevent abuse:

```javascript
const requestCounts = new Map();

function rateLimitMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip)
    .filter(time => time > windowStart);

  if (requests.length > 100) {
    return res.status(429).error({
      message: 'Too many requests',
      code: 429
    });
  }

  requests.push(now);
  requestCounts.set(ip, requests);
  next();
}

app.use(rateLimitMiddleware);
```

### Request Size Limiting

Limit request body size:

```javascript
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

app.use((req, res, next) => {
  let size = 0;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      res.status(413).error({
        message: 'Payload too large',
        code: 413
      });
      req.destroy();
    }
  });

  next();
});
```

---

## Environment Variables

### Secure Configuration

Use environment variables for sensitive data:

```javascript
// .env
DATABASE_URL=postgresql://user:pass@localhost/db
API_KEY=secret-key-here
JWT_SECRET=jwt-secret-key
NODE_ENV=production
```

### Load Environment Variables

```javascript
import dotenv from 'dotenv';

dotenv.config();

const app = new App();

// Use environment variables
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!dbUrl || !apiKey || !jwtSecret) {
  throw new Error('Missing required environment variables');
}
```

### Never Commit Secrets

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
secrets/
```

---

## Common Vulnerabilities

### SQL Injection Prevention

Use parameterized queries:

```javascript
// WRONG - Vulnerable to SQL injection
app.get('/users/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  // DON'T DO THIS
});

// CORRECT - Use parameterized queries
app.get('/users/:id', (req, res) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const values = [req.params.id];
  // Use prepared statements with your database driver
});
```

### XSS Prevention

Escape HTML output:

```javascript
import { escapeHtml } from 'escape-html';

app.get('/user/:id', (req, res) => {
  const userData = {
    name: escapeHtml(req.params.id)
  };
  res.json(userData);
});
```

### CSRF Protection

Implement CSRF tokens:

```javascript
import crypto from 'crypto';

const csrfTokens = new Map();

app.get('/form', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, true);

  res.json({ csrfToken: token });
});

app.post('/form', (req, res) => {
  const { csrfToken } = req.body;

  if (!csrfTokens.has(csrfToken)) {
    return res.status(403).error({
      message: 'Invalid CSRF token',
      code: 403
    });
  }

  csrfTokens.delete(csrfToken);
  res.json({ success: true });
});
```

### Path Traversal Prevention

Validate file paths:

```javascript
import path from 'path';

app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Prevent path traversal
  if (filename.includes('..') || filename.startsWith('/')) {
    return res.status(400).error({
      message: 'Invalid filename',
      code: 400
    });
  }

  const filepath = path.join('/safe/directory', filename);
  res.download(filepath);
});
```

---

## Security Checklist

- [ ] Validate all user input
- [ ] Use HTTPS in production
- [ ] Set appropriate CORS origins
- [ ] Implement authentication
- [ ] Use rate limiting
- [ ] Limit request/file sizes
- [ ] Hide error details in production
- [ ] Use environment variables for secrets
- [ ] Enable XXE protection (default)
- [ ] Implement CSRF protection
- [ ] Prevent SQL injection
- [ ] Escape HTML output
- [ ] Prevent path traversal
- [ ] Log security events
- [ ] Keep dependencies updated
- [ ] Use security headers
- [ ] Implement input sanitization
- [ ] Use parameterized queries
- [ ] Validate file types
- [ ] Store files outside web root

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [CWE Top 25](https://cwe.mitre.org/top25/)
