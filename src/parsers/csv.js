import { parse } from 'csv-parse/sync';

/**
 * Parse CSV with advanced options
 * @param {Buffer} buffer - Buffer containing CSV data
 * @param {object} options - Parser options
 * @param {boolean} options.headers - Use first row as headers (default: true)
 * @param {string} options.delimiter - Field delimiter (default: ',')
 * @param {boolean} options.skipEmptyLines - Skip empty lines (default: true)
 * @param {object} options.schema - Schema validation (optional)
 * @returns {array} Parsed CSV records
 * @throws {Error} If CSV is invalid
 */
function parseCSV(buffer, options = {}) {
  try {
    const csvString = buffer.toString('utf-8');
    
    if (!csvString.trim()) {
      throw new Error('Empty CSV body');
    }
    
    const parseOptions = {
      columns: options.headers !== false,
      skip_empty_lines: options.skipEmptyLines !== false,
      delimiter: options.delimiter || ',',
      ...options
    };
    
    const records = parse(csvString, parseOptions);
    
    // Validate against schema if provided
    if (options.schema) {
      records.forEach((record, index) => {
        for (const field of Object.keys(options.schema)) {
          const validator = options.schema[field];
          if (validator && !validator(record[field])) {
            throw new Error(`Invalid value for field '${field}' at row ${index + 1}`);
          }
        }
      });
    }
    
    return records;
  } catch (err) {
    const error = new Error(`Invalid CSV: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }
}

export default parseCSV;