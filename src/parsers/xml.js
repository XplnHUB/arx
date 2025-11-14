import { parseStringPromise } from 'xml2js';

/**
 * Parse XML with validation and safe mode
 * @param {Buffer} buffer - Buffer containing XML data
 * @param {object} options - Parser options
 * @param {boolean} options.safeMode - Enable safe mode (disable external entities) (default: true)
 * @param {boolean} options.strict - Strict parsing mode (default: true)
 * @returns {object} Parsed XML object
 * @throws {Error} If XML is invalid
 */
async function parseXML(buffer, options = {}) {
  try {
    const xmlString = buffer.toString('utf-8');
    
    if (!xmlString.trim()) {
      throw new Error('Empty XML body');
    }
    
    const parseOptions = {
      strict: options.strict !== false,
      // Safe mode: disable external entity processing by default
      ...(options.safeMode !== false && {
        doctype: null,
        external: false
      }),
      ...options
    };
    
    const result = await parseStringPromise(xmlString, parseOptions);
    return result;
  } catch (err) {
    const error = new Error(`Invalid XML: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseXML;