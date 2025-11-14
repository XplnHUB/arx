/**
 * Parse TOML (Tom's Obvious, Minimal Language)
 * Note: Requires 'toml' package to be installed
 * @param {Buffer} buffer - Buffer containing TOML data
 * @param {object} options - Parser options
 * @returns {object} Parsed TOML object
 * @throws {Error} If TOML is invalid or package not installed
 */
function parseTOML(buffer, options = {}) {
  try {
    // Dynamically import TOML parser
    const tomlModule = require('toml');
    const tomlString = buffer.toString('utf-8');

    if (!tomlString.trim()) {
      throw new Error('Empty TOML body');
    }

    return tomlModule.parse(tomlString);
  } catch (err) {
    if (err.message.includes('Cannot find module')) {
      const error = new Error(
        'TOML parser not installed. Install with: npm install toml'
      );
      error.statusCode = 500;
      throw error;
    }

    const error = new Error(`Invalid TOML: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseTOML;
