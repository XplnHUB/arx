/**
 * Development server with auto-reload support
 * Watches for file changes and restarts the server
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

class DevServer {
  constructor(entryFile, options = {}) {
    this.entryFile = entryFile;
    this.watchDir = options.watchDir || path.dirname(entryFile);
    this.extensions = options.extensions || ['.js', '.json'];
    this.ignorePatterns = options.ignorePatterns || [
      'node_modules',
      '.git',
      'dist',
      'build'
    ];
    this.debounceMs = options.debounceMs || 300;
    this.process = null;
    this.watchers = [];
    this.debounceTimer = null;
  }

  /**
   * Check if file should be watched
   */
  shouldWatch(filePath) {
    // Check extension
    if (!this.extensions.includes(path.extname(filePath))) {
      return false;
    }

    // Check ignore patterns
    for (const pattern of this.ignorePatterns) {
      if (filePath.includes(pattern)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Restart the server
   */
  restart() {
    console.log('🔄 Restarting server...');

    if (this.process) {
      this.process.kill();
    }

    this.process = spawn('node', [this.entryFile], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    this.process.on('error', (err) => {
      console.error('❌ Server error:', err.message);
    });

    this.process.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
      }
    });

    console.log('✅ Server restarted');
  }

  /**
   * Watch directory for changes
   */
  watch(dir) {
    try {
      const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        const filePath = path.join(dir, filename);

        if (!this.shouldWatch(filePath)) {
          return;
        }

        // Debounce file changes
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          console.log(`📝 File changed: ${filename}`);
          this.restart();
        }, this.debounceMs);
      });

      this.watchers.push(watcher);
    } catch (err) {
      console.error(`Error watching directory ${dir}:`, err.message);
    }
  }

  /**
   * Start the development server
   */
  start() {
    console.log(`🚀 Starting development server...`);
    console.log(`📁 Watching: ${this.watchDir}`);
    console.log(`📄 Extensions: ${this.extensions.join(', ')}`);
    console.log('');

    // Start initial server
    this.restart();

    // Start watching
    this.watch(this.watchDir);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      this.stop();
      process.exit(0);
    });
  }

  /**
   * Stop the development server
   */
  stop() {
    if (this.process) {
      this.process.kill();
    }

    this.watchers.forEach(watcher => watcher.close());
    this.watchers = [];

    clearTimeout(this.debounceTimer);
  }
}

/**
 * Create and start a development server
 */
function createDevServer(entryFile, options = {}) {
  const server = new DevServer(entryFile, options);
  server.start();
  return server;
}

export default createDevServer;
export { DevServer };
