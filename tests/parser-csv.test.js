import { describe, it, expect } from 'vitest';
import parseCSV from '../src/parsers/csv.js';

describe('CSV Parser', () => {
  it('should parse basic CSV with headers', () => {
    const buffer = Buffer.from('name,age,city\nJohn,30,NYC\nJane,25,LA');
    const result = parseCSV(buffer);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'John', age: '30', city: 'NYC' });
    expect(result[1]).toEqual({ name: 'Jane', age: '25', city: 'LA' });
  });

  it('should parse CSV without headers', () => {
    const buffer = Buffer.from('John,30,NYC\nJane,25,LA');
    const result = parseCSV(buffer, { headers: false });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(['John', '30', 'NYC']);
  });

  it('should skip empty lines', () => {
    const buffer = Buffer.from('name,age\nJohn,30\n\nJane,25\n');
    const result = parseCSV(buffer);
    expect(result).toHaveLength(2);
  });

  it('should handle custom delimiters', () => {
    const buffer = Buffer.from('name;age;city\nJohn;30;NYC\nJane;25;LA');
    const result = parseCSV(buffer, { delimiter: ';' });
    expect(result[0]).toEqual({ name: 'John', age: '30', city: 'NYC' });
  });

  it('should throw error for empty CSV', () => {
    const buffer = Buffer.from('');
    expect(() => parseCSV(buffer)).toThrow('Empty CSV body');
  });

  it('should throw error with 400 status code', () => {
    try {
      parseCSV(Buffer.from(''));
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  it('should validate against schema', () => {
    const buffer = Buffer.from('name,age\nJohn,30\nJane,invalid');
    const schema = {
      age: (val) => !isNaN(parseInt(val))
    };
    expect(() => parseCSV(buffer, { schema })).toThrow();
  });

  it('should handle quoted fields', () => {
    const buffer = Buffer.from('name,description\nJohn,"Hello, World"\nJane,"Test"');
    const result = parseCSV(buffer);
    expect(result[0].description).toContain('Hello, World');
  });

  it('should handle single row CSV', () => {
    const buffer = Buffer.from('name,age,city\nJohn,30,NYC');
    const result = parseCSV(buffer);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John');
  });
});
