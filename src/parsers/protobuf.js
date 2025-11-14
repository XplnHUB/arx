/**
 * Parse Protocol Buffers (protobuf) binary format
 * Note: Requires 'protobufjs' package to be installed
 * @param {Buffer} buffer - Buffer containing protobuf data
 * @param {object} options - Parser options
 * @param {string} options.protoPath - Path to .proto file
 * @param {string} options.messageName - Name of the message type to decode
 * @returns {object} Parsed protobuf object
 * @throws {Error} If protobuf is invalid or package not installed
 */
async function parseProtobuf(buffer, options = {}) {
  try {
    if (!options.protoPath || !options.messageName) {
      throw new Error(
        'protoPath and messageName options are required for protobuf parsing'
      );
    }

    // Dynamically import protobufjs
    const protobuf = require('protobufjs');

    if (!buffer || buffer.length === 0) {
      throw new Error('Empty protobuf body');
    }

    // Load proto file
    const root = await protobuf.load(options.protoPath);
    const messageType = root.lookupType(options.messageName);

    if (!messageType) {
      throw new Error(`Message type "${options.messageName}" not found in proto`);
    }

    // Decode the buffer
    const message = messageType.decode(buffer);
    return messageType.toObject(message);
  } catch (err) {
    if (err.message.includes('Cannot find module')) {
      const error = new Error(
        'Protobuf parser not installed. Install with: npm install protobufjs'
      );
      error.statusCode = 500;
      throw error;
    }

    const error = new Error(`Invalid Protobuf: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseProtobuf;
