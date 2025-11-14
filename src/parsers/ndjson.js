/**
 * Parse NDJSON (newline-delimited JSON)
 * @param {Buffer} buffer - Buffer containing NDJSON data
 * @param {object} options - Parser options
 * @returns {array} Array of parsed JSON objects
 * @throws {Error} If NDJSON is invalid
 */
function parseNDJSON(buffer, options = {}) {
  try {
    const ndjsonString = buffer.toString('utf-8');

    if (!ndjsonString.trim()) {
      throw new Error('Empty NDJSON body');
    }

    const lines = ndjsonString.trim().split('\n');
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        results.push(JSON.parse(line));
      } catch (err) {
        throw new Error(`Invalid JSON at line ${i + 1}: ${err.message}`);
      }
    }

    if (results.length === 0) {
      throw new Error('No valid NDJSON records found');
    }

    return results;
  } catch (err) {
    const error = new Error(`Invalid NDJSON: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseNDJSON;
