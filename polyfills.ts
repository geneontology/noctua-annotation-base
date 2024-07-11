import 'zone.js';  // Included with Angular CLI.

// Polyfills for Node.js core modules
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};

// Add polyfills for node modules
(window as any).Buffer = (window as any).Buffer || require('buffer').Buffer;
(window as any).process = (window as any).process || require('process/browser');