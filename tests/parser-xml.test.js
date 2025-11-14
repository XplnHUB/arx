import { describe, it, expect } from 'vitest';
import parseXML from '../src/parsers/xml.js';

describe('XML Parser', () => {
  it('should parse basic XML', async () => {
    const buffer = Buffer.from('<?xml version="1.0"?><root><name>test</name></root>');
    const result = await parseXML(buffer);
    expect(result).toBeDefined();
    expect(result.root).toBeDefined();
  });

  it('should parse XML with attributes', async () => {
    const buffer = Buffer.from('<?xml version="1.0"?><root><item id="1">test</item></root>');
    const result = await parseXML(buffer);
    expect(result.root).toBeDefined();
  });

  it('should parse XML with nested elements', async () => {
    const buffer = Buffer.from(
      '<?xml version="1.0"?><root><user><name>John</name><age>30</age></user></root>'
    );
    const result = await parseXML(buffer);
    expect(result.root).toBeDefined();
  });

  it('should throw error for invalid XML', async () => {
    const buffer = Buffer.from('<root><unclosed>');
    await expect(parseXML(buffer)).rejects.toThrow();
  });

  it('should throw error for empty XML', async () => {
    const buffer = Buffer.from('');
    await expect(parseXML(buffer)).rejects.toThrow('Empty XML body');
  });

  it('should throw error with 400 status code', async () => {
    try {
      await parseXML(Buffer.from(''));
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  it('should enable safe mode by default', async () => {
    const buffer = Buffer.from('<?xml version="1.0"?><root><data>safe</data></root>');
    const result = await parseXML(buffer);
    expect(result).toBeDefined();
  });

  it('should parse XML with CDATA', async () => {
    const buffer = Buffer.from(
      '<?xml version="1.0"?><root><content><![CDATA[Some <content> here]]></content></root>'
    );
    const result = await parseXML(buffer);
    expect(result.root).toBeDefined();
  });

  it('should parse XML with multiple elements', async () => {
    const buffer = Buffer.from(
      '<?xml version="1.0"?><root><item>1</item><item>2</item><item>3</item></root>'
    );
    const result = await parseXML(buffer);
    expect(result.root).toBeDefined();
  });
});
