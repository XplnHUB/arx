# ARX Architecture Overview

This document describes the internal architecture and design patterns of the ARX framework.

## Table of Contents

- [Overview](#overview)
- [Core Components](#core-components)
- [Request Flow](#request-flow)
- [Module Structure](#module-structure)
- [Design Patterns](#design-patterns)

---

## Overview

ARX is a lightweight, multi-format backend framework built on Node.js's native HTTP module. It provides:

- **Express-like routing** with parameter and wildcard support
- **Automatic content-type detection** and parsing
- **Middleware system** with global and route-level support
- **Enhanced response helpers** for multiple formats
- **Error handling** with custom middleware
- **Graceful shutdown** with cleanup hooks

The framework is designed to be minimal yet extensible, allowing developers to handle multiple data formats without external dependencies for routing or middleware.

---

## Core Components

### 1. App (`src/core/app.js`)

The main application class that orchestrates the framework.

**Responsibilities:**
- Route registration (GET, POST, PUT, DELETE, PATCH)
- Global middleware management
- CORS configuration
- Shutdown hook management
- Server lifecycle (listen, shutdown)

**Key Methods:**
- `get/post/put/delete/patch(path, ...handlers)` - Register routes
- `use(middleware)` - Register middleware
- `useError(handler)` - Register error handlers
- `cors(options)` - Configure CORS
- `onShutdown(hook)` - Register cleanup hooks
- `listen(port, callback)` - Start server
- `shutdown()` - Graceful shutdown

### 2. Router (`src/core/router.js`)

Handles route matching and parameter extraction.

**Responsibilities:**
- Route registration and storage
- Path-to-regex conversion
- Parameter extraction from URLs
- Query string parsing
- CORS header injection
- Handler execution

**Key Methods:**
- `addRoute(method, path, ...handlers)` - Register route
- `match(method, url)` - Find matching route
- `_pathToRegex(path)` - Convert path to regex
- `_extractParams(paramNames, match)` - Extract route params
- `_parseQuery(queryString)` - Parse query params
- `_setCorsHeaders(res)` - Apply CORS headers

**Route Pattern Support:**
- Static: `/users`
- Parameters: `/users/:id`
- Wildcards: `/files/*`
- Multiple params: `/users/:userId/posts/:postId`

### 3. Middleware Engine (`src/core/middleware.js`)

Executes middleware chain with async support.

**Responsibilities:**
- Sequential middleware execution
- Async/await support
- Error handling and propagation
- Error handler middleware detection

**Key Features:**
- Automatic async middleware detection
- Error middleware (4 parameters) handling
- Promise-based execution

### 4. Server (`src/core/server.js`)

HTTP server creation and request handling.

**Responsibilities:**
- HTTP server creation
- Request parsing
- Response enhancement
- Middleware execution
- Route matching
- Global error handling

**Request Processing:**
1. Parse request body based on content-type
2. Enhance response object
3. Execute global middleware
4. Match route
5. Execute route handlers
6. Handle errors

### 5. Parsers (`src/parsers/`)

Content-type specific parsing modules.

**Supported Formats:**
- **JSON** (`json.js`) - Application/json
- **CSV** (`csv.js`) - Text/csv, Application/csv
- **XML** (`xml.js`) - Application/xml, Text/xml
- **YAML** (`yaml.js`) - Application/x-yaml, Text/yaml
- **Form-Data** (`formdata.js`) - Multipart/form-data
- **Binary** (`binary.js`) - Other formats

**Parser Features:**
- Error handling with status codes
- Advanced options support
- Schema validation (CSV)
- Safe mode (XML)
- Multi-document support (YAML)
- File size limits (Form-Data)

### 6. Response Enhancement (`src/response/enhance.js`)

Adds helper methods to response object.

**Methods:**
- `status(code)` - Set status code
- `set(header, value)` - Set header
- `json(data)` - Send JSON
- `send(data)` - Send text/buffer
- `csv(data)` - Send CSV
- `xml(data)` - Send XML
- `yaml(data)` - Send YAML
- `file(buffer, mimetype)` - Send binary
- `error(options)` - Send error response
- `stream(stream)` - Pipe stream
- `download(path, filename)` - Send file download

### 7. Utilities (`src/utils/`)

Helper functions for common tasks.

**Utilities:**
- `detectContentType.js` - Parse content-type header
- `streamToBuffer.js` - Convert stream to buffer
- `urlParser.js` - Parse URL components
- `deepMerge.js` - Recursively merge objects

---

## Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Incoming HTTP Request                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Parse Request Body            │
        │  (based on content-type)       │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Enhance Response Object       │
        │  (add helper methods)          │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Execute Global Middleware     │
        │  (in order)                    │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Match Route                   │
        │  (method + path)               │
        └────────────┬───────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
        ┌───▼──┐          ┌──▼────┐
        │Found │          │ Not   │
        │      │          │ Found │
        └───┬──┘          └──┬────┘
            │                │
            ▼                ▼
    ┌──────────────┐   ┌─────────────┐
    │Execute Route │   │Send 404     │
    │Handlers      │   │Response     │
    └──────┬───────┘   └─────────────┘
           │
           ▼
    ┌──────────────┐
    │Send Response │
    └──────────────┘
```

---

## Module Structure

```
arx/
├── src/
│   ├── core/
│   │   ├── app.js           # Main App class
│   │   ├── router.js        # Route matching
│   │   ├── middleware.js    # Middleware engine
│   │   └── server.js        # HTTP server
│   ├── parsers/
│   │   ├── index.js         # Parser dispatcher
│   │   ├── json.js          # JSON parser
│   │   ├── csv.js           # CSV parser
│   │   ├── xml.js           # XML parser
│   │   ├── yaml.js          # YAML parser
│   │   ├── formdata.js      # Form-data parser
│   │   └── binary.js        # Binary parser
│   ├── response/
│   │   └── enhance.js       # Response helpers
│   └── utils/
│       ├── detectContentType.js
│       ├── streamToBuffer.js
│       ├── urlParser.js
│       └── deepMerge.js
├── tests/
├── docs/
├── examples/
├── index.js                 # Entry point
├── index.d.ts              # TypeScript definitions
└── package.json
```

---

## Design Patterns

### 1. Middleware Chain Pattern

Middleware is executed sequentially with a `next()` callback:

```javascript
app.use((req, res, next) => {
  // Do something
  next(); // Continue to next middleware
});
```

**Features:**
- Error propagation via `next(err)`
- Async support with promises
- Error handler detection (4 parameters)

### 2. Route Handler Pattern

Routes accept multiple handlers (middleware + final handler):

```javascript
app.get('/path',
  (req, res, next) => { /* middleware */ next(); },
  (req, res) => { /* handler */ }
);
```

### 3. Content-Type Negotiation

Automatic parsing based on `Content-Type` header:

```
Content-Type: application/json     → parseJSON()
Content-Type: text/csv             → parseCSV()
Content-Type: application/xml      → parseXML()
Content-Type: application/x-yaml   → parseYAML()
Content-Type: multipart/form-data  → parseFormData()
```

### 4. Response Enhancement

Response object is enhanced with format-specific methods:

```javascript
res.json(data)      // JSON response
res.csv(data)       // CSV response
res.xml(data)       // XML response
res.yaml(data)      // YAML response
res.download(path)  // File download
```

### 5. Error Handling

Three-level error handling:

1. **Parser errors** - Caught during request parsing
2. **Middleware errors** - Passed via `next(err)`
3. **Route errors** - Caught by error handlers

Error handlers are identified by 4 parameters:

```javascript
app.useError((err, req, res, next) => {
  // Handle error
});
```

### 6. Graceful Shutdown

Shutdown hooks allow cleanup:

```javascript
app.onShutdown(async () => {
  // Close connections
  // Cleanup resources
});
```

---

## Performance Considerations

### 1. Route Matching

- Routes are stored in an array
- Linear search through routes (O(n))
- Regex compilation happens at registration time
- Consider route ordering for frequently accessed paths

### 2. Middleware Execution

- Middleware runs sequentially
- Async middleware is awaited
- Early termination possible via response send

### 3. Parser Performance

- Streaming for large files (form-data)
- Buffer-based parsing for other formats
- Schema validation optional (CSV)

### 4. Memory Management

- Form-data has configurable limits
- Stream-based parsing for large uploads
- Automatic cleanup on server shutdown

---

## Extension Points

### Custom Middleware

```javascript
app.use((req, res, next) => {
  // Custom logic
  next();
});
```

### Custom Error Handlers

```javascript
app.useError((err, req, res, next) => {
  // Custom error handling
});
```

### Custom Parsers

Extend the parser dispatcher in `src/parsers/index.js`:

```javascript
if (contentType === 'custom/format') {
  body = parseCustom(buffer);
  bodyType = 'custom';
}
```

### Custom Response Methods

Extend response in `src/response/enhance.js`:

```javascript
res.custom = (data) => {
  res.setHeader('Content-Type', 'custom/format');
  res.end(data);
};
```

---

## Security Considerations

### 1. XML External Entity (XXE) Protection

XML parser runs in safe mode by default:
- External entities disabled
- DOCTYPE processing disabled

### 2. File Upload Limits

Form-data parser enforces:
- File size limits (10MB default)
- Total memory limits (50MB default)
- File count limits (10 default)

### 3. CORS Configuration

CORS headers are configurable:
- Origin validation
- Method restrictions
- Header filtering

### 4. Error Messages

Production mode hides error details:
- Development: Full error messages
- Production: Generic error messages

---

## Future Enhancements

### Planned Features

1. **Route Caching** - Cache compiled route patterns
2. **Middleware Caching** - Pre-compile middleware chains
3. **Request Pooling** - Reuse request/response objects
4. **Plugin System** - Load custom modules
5. **Rate Limiting** - Built-in rate limiting middleware
6. **Compression** - Gzip/brotli compression
7. **Clustering** - Multi-process support
8. **Metrics** - Built-in performance metrics

### Optimization Opportunities

1. Replace linear route search with trie-based matching
2. Implement middleware pre-compilation
3. Add request/response object pooling
4. Optimize regex compilation
5. Add caching layer for parsed requests
