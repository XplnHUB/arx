/**
 * Parse MessagePack binary format
 * Note: Requires 'msgpackr' package to be installed
 * @param {Buffer} buffer - Buffer containing MessagePack data
 * @param {object} options - Parser options
 * @returns {object} Parsed MessagePack object
 * @throws {Error} If MessagePack is invalid or package not installed
 */
function parseMessagePack(buffer, options = {}) {
  try {
    // Dynamically import MessagePack parser
    const { Unpack } = require('msgpackr');
    const unpack = new Unpack();

    if (!buffer || buffer.length === 0) {
      throw new Error('Empty MessagePack body');
    }

    return unpack.unpack(buffer);
  } catch (err) {
    if (err.message.includes('Cannot find module')) {
      const error = new Error(
        'MessagePack parser not installed. Install with: npm install msgpackr'
      );
      error.statusCode = 500;
      throw error;
    }

    const error = new Error(`Invalid MessagePack: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseMessagePack;
