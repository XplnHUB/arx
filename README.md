# arx

**arx** is a modern Node.js backend framework designed for developers who want to handle multiple data formats effortlessly. It combines the simplicity of Express-style routing with automatic parsing for JSON, CSV, XML, YAML, form-data, and binary data.

Arx is ideal for building APIs, file processing services, IoT backends, and any server that needs to work with multiple data formats without extra boilerplate.

---

## Features

* Express-style API with `app.get()`, `app.post()`, `app.use()` syntax.
* Automatic body parsing for multiple formats:

  * JSON (`application/json`)
  * CSV (`text/csv`)
  * XML (`application/xml`)
  * YAML (`application/x-yaml`)
  * Form-data (`multipart/form-data`)
  * Binary (`application/octet-stream`)
* Stream handling for large file uploads and streaming data.
* Middleware system compatible with custom or third-party middleware.
* Unified request object: `req.body` contains parsed data regardless of format.
* Response helpers: `res.json()`, `res.csv()`, `res.xml()`, `res.yaml()`, `res.file()`.

---

## Installation

```bash
npm install arx
```

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
app.listen(3000, () => console.log("Arx running on http://localhost:3000"));
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
--data "name,age\nAlice,25\nBob,30"
```

**XML**

```bash
curl -X POST http://localhost:3000/xml \
-H "Content-Type: application/xml" \
--data "<users><user><name>Alice</name><age>25</age></user></users>"
```

**Binary**

```bash
curl -X POST http://localhost:3000/binary \
-H "Content-Type: application/octet-stream" \
--data-binary "@largefile.bin"
```

---

## How It Works

1. The HTTP server receives the request.
2. The auto-detect parser identifies the content type and parses the body into `req.body`.
3. Middleware functions are executed.
4. The appropriate route handler is called.
5. Response helpers send data back to the client.

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
