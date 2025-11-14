# arx

**arx** is a modern Node.js backend framework designed for developers who want to handle multiple data formats effortlessly. It combines the simplicity of Express-style routing with automatic parsing for JSON, CSV, XML, YAML, form-data, and binary data.

arx is ideal for building APIs, file processing services, IoT backends, and any server that needs to work with multiple data formats without extra boilerplate.

---

## Features

* **Express-style API** with `app.get()`, `app.post()`, `app.use()` syntax.
* **Automatic body parsing** for multiple formats:
  * JSON (`application/json`)
  * CSV (`text/csv`)
  * XML (`application/xml`)
  * YAML (`application/x-yaml`)
  * Form-data (`multipart/form-data`)
  * Binary (`application/octet-stream`)
* **Stream handling** for large file uploads and streaming data.
* **Middleware system** with global, path-specific, and route-level support.
* **Async middleware** support with full promise-based execution.
* **Error handling middleware** for centralized error management.
* **Route parameters** and wildcard routes (`/users/:id`, `/files/*`).
* **Query string parsing** with automatic parameter extraction.
* **Enhanced response helpers**:
  * `res.status(code)` - Set HTTP status code
  * `res.set(header, value)` - Set response headers
  * `res.json()`, `res.csv()`, `res.xml()`, `res.yaml()` - Format-specific responses
  * `res.file()`, `res.download()` - File handling
  * `res.error()` - Standardized error responses
  * `res.stream()` - Stream piping
* **Graceful shutdown** with cleanup hooks.
* **CORS support** with configurable options.
* **TypeScript definitions** for full type safety.
* **Comprehensive error handling** with status codes and detailed messages.
* **File upload limits** with configurable size and memory constraints.
* **XXE protection** for XML parsing (enabled by default).

---

## Installation

```bash
npm install arx
````

---

## Quick Start

```js
import arx from "arx";

const app = arx();

// Middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} | BodyType: ${req.bodyType}`);
  next();
});

// JSON route
app.post("/json", (req, res) => {
  res.json({ received: req.body, type: req.bodyType });
});

// CSV route
app.post("/csv", (req, res) => {
  res.json({ received: req.body, type: req.bodyType });
});

// XML route
app.post("/xml", (req, res) => {
  res.json({ received: req.body, type: req.bodyType });
});

// Binary route
app.post("/binary", (req, res) => {
  res.send(`Binary data received: ${req.body.length} bytes`);
});

// Start server
app.listen(3000, () => console.log("arx running on http://localhost:3000"));
```

---

## Example Requests

**JSON**

```bash
curl -X POST http://localhost:3000/json \
-H "Content-Type: application/json" \
-d '{"name":"arpit","age":20}'
```

**CSV**

```bash
curl -X POST http://localhost:3000/csv \
-H "Content-Type: text/csv" \
--data "name,age\narpit,20\nadarsh,19"
```

**XML**

```bash
curl -X POST http://localhost:3000/xml \
-H "Content-Type: application/xml" \
--data "<users><user><name>arpit</name><age>20</age></user></users>"
```

**Binary**

```bash
curl -X POST http://localhost:3000/binary \
-H "Content-Type: application/octet-stream" \
--data-binary "@largefile.bin"
```

---

## Documentation

* **[API Reference](./docs/api.md)** - Complete API documentation with examples
* **[Architecture Overview](./docs/architecture.md)** - Internal design and patterns
* **[Security Practices](./docs/security.md)** - Security guidelines and best practices
* **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions

---

## How It Works

1. The HTTP server receives the request.
2. The auto-detect parser identifies the content type and parses the body into `req.body`.
3. Middleware functions are executed in order.
4. The appropriate route handler is called with extracted parameters.
5. Response helpers send data back to the client in the desired format.

---

## Roadmap

**v1.0 – Core Framework**

* JSON, CSV, XML, YAML, Form-data, Binary parsing
* Express-style routing
* Middleware support
* Basic response helpers

**v1.5 – Developer Experience**

* CLI for scaffolding projects
* Hot reload for routes
* Auto-generated API documentation

**v2.0 – Advanced Features**

* AI-assisted validation and error suggestions
* Edge/serverless deployment support
* Multi-protocol support (HTTP, WebSocket, gRPC)
* Plugin system for third-party parsers
* Predictive caching and monitoring

**v3.0+ – Next-gen Backend**

* Reactive routes (Observable streams)
* Real-time request/response dashboard
* Versioned APIs and time-travel debugging
* Auto translation between data formats

---

## Contributing

Contributions are welcome. Fork the repository, submit pull requests, or suggest new features.

---

## License

MIT License

