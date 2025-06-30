// MCP Tool Registry
// Central registry for all MCP method handlers with middleware support
// Tool handler registry
const handlers = new Map();
// Middleware registry - middleware runs in order of registration
const middlewares = [];
/**
 * Register a tool handler
 */ export function registerTool(method, handler) {
  if (handlers.has(method)) {
    console.warn(`Tool handler for method '${method}' is being overwritten`);
  }
  handlers.set(method, handler);
}
/**
 * Register multiple tool handlers at once
 */ export function registerTools(tools) {
  for (const [method, handler] of Object.entries(tools)){
    registerTool(method, handler);
  }
}
/**
 * Add middleware to the processing pipeline
 */ export function use(middleware) {
  middlewares.push(middleware);
}
/**
 * Get a tool handler by method name
 */ export function getHandler(method) {
  return handlers.get(method);
}
/**
 * Check if a method has a registered handler
 */ export function hasHandler(method) {
  return handlers.has(method);
}
/**
 * Get all registered method names
 */ export function getRegisteredMethods() {
  return Array.from(handlers.keys()).sort();
}
/**
 * Execute a tool with middleware pipeline
 */ export async function executeTool(method, params, context) {
  const handler = handlers.get(method);
  if (!handler) {
    throw new Error(`No handler registered for method: ${method}`);
  }
  // Build the middleware chain
  let chain = handler;
  // Apply middleware in reverse order so they execute in registration order
  for(let i = middlewares.length - 1; i >= 0; i--){
    const middleware = middlewares[i];
    const next = chain;
    chain = (p, c)=>middleware(p, c, next);
  }
  // Execute the chain
  return await chain(params, context);
}
/**
 * Clear all registered handlers and middleware
 * Useful for testing
 */ export function clearRegistry() {
  handlers.clear();
  middlewares.length = 0;
}
// Example middleware: Request logging
export const loggingMiddleware = async (params, context, next)=>{
  const start = Date.now();
  const method = context.requestId ? `[${context.requestId}]` : "";
  try {
    console.log(`${method} Starting request with params:`, params);
    const result = await next(params, context);
    const duration = Date.now() - start;
    console.log(`${method} Request completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`${method} Request failed after ${duration}ms:`, error);
    throw error;
  }
};
// Example middleware: Parameter sanitization
export const sanitizationMiddleware = async (params, context, next)=>{
  // Create a deep copy to avoid mutating original params
  const sanitized = JSON.parse(JSON.stringify(params));
  // Remove any params that start with underscore (private convention)
  for (const key of Object.keys(sanitized)){
    if (key.startsWith("_")) {
      delete sanitized[key];
    }
  }
  // Trim string values
  for (const [key, value] of Object.entries(sanitized)){
    if (typeof value === "string") {
      sanitized[key] = value.trim();
    }
  }
  return await next(sanitized, context);
};
// Example middleware: Rate limiting check (placeholder)
export const rateLimitMiddleware = async (params, context, next)=>{
  // This is a placeholder - actual implementation would check against
  // a rate limiting service like Upstash
  if (!context.apiKey) {
    throw new Error("API key required for rate limiting");
  }
  // TODO: Implement actual rate limiting check
  // const isAllowed = await checkRateLimit(context.apiKey);
  // if (!isAllowed) {
  //   throw new Error("Rate limit exceeded");
  // }
  return await next(params, context);
};
