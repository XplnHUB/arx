import fs from 'fs';
import path from 'path';

function enhanceResponse(res) {
  // Set HTTP status code
  res.status = (code) => {
    res.statusCode = code;
    return res; // For chaining
  };

  // Set response header
  res.set = (header, value) => {
    res.setHeader(header, value);
    return res; // For chaining
  };

  // Send JSON response
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // Send plain text response
  res.send = (data) => {
    res.end(data);
  };

  // Send CSV response
  res.csv = (data) => {
    res.setHeader('Content-Type', 'text/csv');
    res.end(data);
  };

  // Send XML response
  res.xml = (data) => {
    res.setHeader('Content-Type', 'application/xml');
    res.end(data);
  };

  // Send YAML response
  res.yaml = (data) => {
    res.setHeader('Content-Type', 'application/x-yaml');
    res.end(data);
  };

  // Send binary/file response
  res.file = (buffer, mimetype = 'application/octet-stream') => {
    res.setHeader('Content-Type', mimetype);
    res.end(buffer);
  };

  // Send error response
  res.error = ({ message, code = 500, details = null }) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    const errorObj = { error: true, code, message };
    if (details) errorObj.details = details;
    res.end(JSON.stringify(errorObj));
  };

  // Stream response
  res.stream = (readableStream) => {
    readableStream.pipe(res);
  };

  // Download file
  res.download = (filePath, filename = null) => {
    const resolvedPath = path.resolve(filePath);
    const downloadName = filename || path.basename(resolvedPath);
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      if (!res.headersSent) {
        res.statusCode = 404;
        res.end('File not found');
      }
    });
  };
}

export default enhanceResponse;