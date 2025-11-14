import detectContentType from '../utils/detectContentType.js';
import streamToBuffer from '../utils/streamToBuffer.js';
import parseJSON from './json.js';
import parseCSV from './csv.js';
import parseXML from './xml.js';
import parseYAML from './yaml.js';
import parseFormData from './formdata.js';
import parseBinary from './binary.js';

async function parseRequest(req) {
  const contentType = detectContentType(req.headers['content-type']);

  if (!contentType) {
    req.body = null;
    req.bodyType = null;
    return;
  }

  let body;
  let bodyType;

  if (contentType.startsWith('multipart/form-data')) {
    body = await parseFormData(req);
    bodyType = 'formdata';
  } else {
    const buffer = await streamToBuffer(req);
    if (contentType === 'application/json') {
      body = parseJSON(buffer);
      bodyType = 'json';
    } else if (contentType === 'text/csv' || contentType === 'application/csv') {
      body = parseCSV(buffer);
      bodyType = 'csv';
    } else if (contentType === 'application/xml' || contentType === 'text/xml') {
      body = await parseXML(buffer);
      bodyType = 'xml';
    } else if (contentType === 'application/x-yaml' || contentType === 'text/yaml') {
      body = parseYAML(buffer);
      bodyType = 'yaml';
    } else {
      body = parseBinary(buffer);
      bodyType = 'binary';
    }
  }

  req.body = body;
  req.bodyType = bodyType;
}

export default parseRequest;