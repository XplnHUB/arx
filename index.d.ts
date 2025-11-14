import { IncomingMessage, ServerResponse } from 'http';

export interface ARXRequest extends IncomingMessage {
  body?: any;
  bodyType?: 'json' | 'csv' | 'xml' | 'yaml' | 'formdata' | 'binary' | null;
  params?: Record<string, string>;
  query?: Record<string, string | boolean>;
}

export interface ARXResponse extends ServerResponse {
  status(code: number): ARXResponse;
  set(header: string, value: string): ARXResponse;
  json(data: any): void;
  send(data: string | Buffer): void;
  csv(data: string): void;
  xml(data: string): void;
  yaml(data: string): void;
  file(buffer: Buffer, mimetype?: string): void;
  error(options: { message: string; code?: number; details?: any }): void;
  stream(readableStream: NodeJS.ReadableStream): void;
  download(filePath: string, filename?: string): void;
}

/**
 * Route handler function
 */
export type RouteHandler = (req: ARXRequest, res: ARXResponse, next?: (err?: Error) => void) => void | Promise<void>;

/**
 * Middleware function
 */
export type Middleware = (req: ARXRequest, res: ARXResponse, next: (err?: Error) => void) => void | Promise<void>;

/**
 * Error handler middleware
 */
export type ErrorHandler = (err: Error, req: ARXRequest, res: ARXResponse, next: (err?: Error) => void) => void | Promise<void>;

/**
 * CORS options
 */
export interface CORSOptions {
  origin?: string;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Main App class
 */
export default class App {
  constructor();

  /**
   * Register GET route
   */
  get(path: string, ...handlers: (RouteHandler | Middleware)[]): void;

  /**
   * Register POST route
   */
  post(path: string, ...handlers: (RouteHandler | Middleware)[]): void;

  /**
   * Register PUT route
   */
  put(path: string, ...handlers: (RouteHandler | Middleware)[]): void;

  /**
   * Register DELETE route
   */
  delete(path: string, ...handlers: (RouteHandler | Middleware)[]): void;

  /**
   * Register PATCH route
   */
  patch(path: string, ...handlers: (RouteHandler | Middleware)[]): void;

  /**
   * Register global middleware
   */
  use(middleware: Middleware | string): any;

  /**
   * Register error handling middleware
   */
  useError(handler: ErrorHandler): void;

  /**
   * Configure CORS
   */
  cors(options: CORSOptions): App;

  /**
   * Register shutdown hook
   */
  onShutdown(hook: () => void | Promise<void>): App;

  /**
   * Gracefully shutdown the server
   */
  shutdown(): Promise<void>;

  /**
   * Start listening on port
   */
  listen(port: number, callback?: () => void): any;
}

/**
 * Parser options
 */
export interface ParserOptions {
  [key: string]: any;
}

/**
 * CSV Parser options
 */
export interface CSVParserOptions extends ParserOptions {
  headers?: boolean;
  delimiter?: string;
  skipEmptyLines?: boolean;
  schema?: Record<string, (value: any) => boolean>;
}

/**
 * XML Parser options
 */
export interface XMLParserOptions extends ParserOptions {
  safeMode?: boolean;
  strict?: boolean;
}

/**
 * YAML Parser options
 */
export interface YAMLParserOptions extends ParserOptions {
  multiDoc?: boolean;
}

/**
 * Form-data Parser options
 */
export interface FormDataParserOptions extends ParserOptions {
  fileSizeLimit?: number;
  memoryLimit?: number;
  fileCountLimit?: number;
}

/**
 * Parsed form data
 */
export interface ParsedFormData {
  fields: Record<string, string>;
  files: Record<string, {
    filename: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }>;
}

/**
 * URL Parser result
 */
export interface ParsedURL {
  protocol: string;
  hostname: string;
  port: number;
  pathname: string;
  search: string;
  hash: string;
  query: Record<string, string>;
  href: string;
  origin: string;
}
