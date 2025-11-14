/**
 * Parse JSON with error handling
 * @param {Buffer} buffer - Buffer containing JSON data
 * @param {object} options - Parser options
 * @returns {object} Parsed JSON object
 * @throws {Error} If JSON is invalid
 */
function parseJSON(buffer, options = {}) {
  try {
    const jsonString = buffer.toString('utf-8');
    
    if (!jsonString.trim()) {
      throw new Error('Empty JSON body');
    }
    
    return JSON.parse(jsonString);
  } catch (err) {
    const error = new Error(`Invalid JSON: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseJSON;