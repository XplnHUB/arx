import Busboy from 'busboy';
import streamToBuffer from '../utils/streamToBuffer.js';

/**
 * Parse form-data with file size and memory limits
 * @param {object} req - Request object
 * @param {object} options - Parser options
 * @param {number} options.fileSizeLimit - Max file size in bytes (default: 10MB)
 * @param {number} options.memoryLimit - Max memory usage in bytes (default: 50MB)
 * @param {number} options.fileCountLimit - Max number of files (default: 10)
 * @returns {Promise<object>} Parsed form data with fields and files
 * @throws {Error} If limits are exceeded or parsing fails
 */
function parseFormData(req, options = {}) {
  return new Promise((resolve, reject) => {
    const fileSizeLimit = options.fileSizeLimit || 10 * 1024 * 1024; // 10MB
    const memoryLimit = options.memoryLimit || 50 * 1024 * 1024; // 50MB
    const fileCountLimit = options.fileCountLimit || 10;
    
    let totalMemoryUsed = 0;
    let fileCount = 0;
    
    const busboy = Busboy({ 
      headers: req.headers,
      limits: {
        fileSize: fileSizeLimit,
        files: fileCountLimit
      }
    });
    
    const fields = {};
    const files = {};

    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
      try {
        fileCount++;
        if (fileCount > fileCountLimit) {
          throw new Error(`File count limit exceeded (max: ${fileCountLimit})`);
        }
        
        const buffer = await streamToBuffer(file);
        
        if (buffer.length > fileSizeLimit) {
          throw new Error(`File size exceeds limit (max: ${fileSizeLimit} bytes)`);
        }
        
        totalMemoryUsed += buffer.length;
        if (totalMemoryUsed > memoryLimit) {
          throw new Error(`Total memory limit exceeded (max: ${memoryLimit} bytes)`);
        }
        
        files[fieldname] = {
          filename,
          encoding,
          mimetype,
          size: buffer.length,
          buffer
        };
      } catch (err) {
        reject(err);
      }
    });

    busboy.on('finish', () => {
      resolve({ fields, files });
    });

    busboy.on('error', reject);
    
    // Handle request stream errors
    req.on('error', reject);

    req.pipe(busboy);
  });
}

export default parseFormData;