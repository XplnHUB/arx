import { describe, it, expect, beforeEach } from 'vitest';
import enhanceResponse from '../src/response/enhance.js';
import { ServerResponse } from 'http';
import { Socket } from 'net';

describe('Response Helpers', () => {
  let res;

  beforeEach(() => {
    const socket = new Socket();
    res = new ServerResponse({ socket });
    enhanceResponse(res);
  });

  it('should set status code', () => {
    const result = res.status(201);
    expect(res.statusCode).toBe(201);
    expect(result).toBe(res); // Check chaining
  });

  it('should set response header', () => {
    const result = res.set('X-Custom-Header', 'value');
    expect(res.getHeader('X-Custom-Header')).toBe('value');
    expect(result).toBe(res); // Check chaining
  });

  it('should chain status and set methods', () => {
    res.status(201).set('X-Custom', 'test');
    expect(res.statusCode).toBe(201);
    expect(res.getHeader('X-Custom')).toBe('test');
  });

  it('should have json method', () => {
    expect(typeof res.json).toBe('function');
  });

  it('should have send method', () => {
    expect(typeof res.send).toBe('function');
  });

  it('should have csv method', () => {
    expect(typeof res.csv).toBe('function');
  });

  it('should have xml method', () => {
    expect(typeof res.xml).toBe('function');
  });

  it('should have yaml method', () => {
    expect(typeof res.yaml).toBe('function');
  });

  it('should have file method', () => {
    expect(typeof res.file).toBe('function');
  });

  it('should have error method', () => {
    expect(typeof res.error).toBe('function');
  });

  it('should have stream method', () => {
    expect(typeof res.stream).toBe('function');
  });

  it('should have download method', () => {
    expect(typeof res.download).toBe('function');
  });

  it('should set correct content type for json', () => {
    res.json({ test: 'data' });
    expect(res.getHeader('Content-Type')).toBe('application/json');
  });

  it('should set correct content type for csv', () => {
    res.csv('a,b,c\n1,2,3');
    expect(res.getHeader('Content-Type')).toBe('text/csv');
  });

  it('should set correct content type for xml', () => {
    res.xml('<root></root>');
    expect(res.getHeader('Content-Type')).toBe('application/xml');
  });

  it('should set correct content type for yaml', () => {
    res.yaml('key: value');
    expect(res.getHeader('Content-Type')).toBe('application/x-yaml');
  });

  it('should set error status code', () => {
    res.error({ message: 'Not found', code: 404 });
    expect(res.statusCode).toBe(404);
  });

  it('should set default error status code to 500', () => {
    res.error({ message: 'Server error' });
    expect(res.statusCode).toBe(500);
  });
});
