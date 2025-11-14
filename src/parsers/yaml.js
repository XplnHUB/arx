import yaml from 'yaml';

/**
 * Parse YAML with multi-document support
 * @param {Buffer} buffer - Buffer containing YAML data
 * @param {object} options - Parser options
 * @param {boolean} options.multiDoc - Parse multiple documents (default: false)
 * @returns {object|array} Parsed YAML object or array of objects
 * @throws {Error} If YAML is invalid
 */
function parseYAML(buffer, options = {}) {
  try {
    const yamlString = buffer.toString('utf-8');
    
    if (!yamlString.trim()) {
      throw new Error('Empty YAML body');
    }
    
    if (options.multiDoc) {
      // Parse multiple YAML documents separated by ---
      return yaml.parseAllDocuments(yamlString).map(doc => doc.toJSON());
    } else {
      return yaml.parse(yamlString);
    }
  } catch (err) {
    const error = new Error(`Invalid YAML: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseYAML;