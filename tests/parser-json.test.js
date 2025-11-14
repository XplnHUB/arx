import { describe, it, expect } from 'vitest';
import parseJSON from '../src/parsers/json.js';

describe('JSON Parser', () => {
  it('should parse valid JSON', () => {
    const buffer = Buffer.from('{"name":"test","value":123}');
    const result = parseJSON(buffer);
    expect(result).toEqual({ name: 'test', value: 123 });
  });

  it('should parse JSON arrays', () => {
    const buffer = Buffer.from('[1,2,3,{"id":4}]');
    const result = parseJSON(buffer);
    expect(result).toEqual([1, 2, 3, { id: 4 }]);
  });

  it('should parse JSON with nested objects', () => {
    const buffer = Buffer.from('{"user":{"name":"John","age":30}}');
    const result = parseJSON(buffer);
    expect(result).toEqual({ user: { name: 'John', age: 30 } });
  });

  it('should throw error for invalid JSON', () => {
    const buffer = Buffer.from('{invalid json}');
    expect(() => parseJSON(buffer)).toThrow();
  });

  it('should throw error for empty JSON', () => {
    const buffer = Buffer.from('');
    expect(() => parseJSON(buffer)).toThrow('Empty JSON body');
  });

  it('should throw error with 400 status code', () => {
    const buffer = Buffer.from('{invalid}');
    try {
      parseJSON(buffer);
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  it('should parse JSON with special characters', () => {
    const buffer = Buffer.from('{"message":"Hello\\nWorld","emoji":"😀"}');
    const result = parseJSON(buffer);
    expect(result.message).toContain('Hello');
    expect(result.emoji).toBe('😀');
  });

  it('should parse JSON with null values', () => {
    const buffer = Buffer.from('{"value":null,"empty":null}');
    const result = parseJSON(buffer);
    expect(result.value).toBeNull();
    expect(result.empty).toBeNull();
  });

  it('should parse JSON with boolean values', () => {
    const buffer = Buffer.from('{"active":true,"deleted":false}');
    const result = parseJSON(buffer);
    expect(result.active).toBe(true);
    expect(result.deleted).toBe(false);
  });
});
