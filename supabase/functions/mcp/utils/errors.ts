// MCP Error Handling Utilities
// Standardized error handling for the MCP protocol
export class MCPError extends Error {
  code;
  data;
  statusCode;
  constructor(code, message, data, statusCode = 500){
    super(message);
    this.name = "MCPError";
    this.code = code;
    this.data = data;
    this.statusCode = statusCode;
  }
}
// Standard JSON-RPC 2.0 error codes
export const JsonRpcErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // Server error codes reserved from -32000 to -32099
  SERVER_ERROR_START: -32000,
  SERVER_ERROR_END: -32099
};
// Application-specific error codes
export const AppErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  API_KEY_INVALID: "API_KEY_INVALID",
  API_KEY_EXPIRED: "API_KEY_EXPIRED",
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  // Resource Errors
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  // Validation Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_FORMAT: "INVALID_FORMAT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  // Database Errors
  DATABASE_ERROR: "DATABASE_ERROR",
  TRANSACTION_FAILED: "TRANSACTION_FAILED",
  // External Service Errors
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  UPSTASH_ERROR: "UPSTASH_ERROR",
  OPENAI_ERROR: "OPENAI_ERROR"
};
// Error definitions with default messages and status codes
export const ErrorDefinitions = {
  // JSON-RPC errors
  PARSE_ERROR: {
    code: JsonRpcErrorCodes.PARSE_ERROR,
    message: "Invalid JSON was received by the server",
    statusCode: 400
  },
  INVALID_REQUEST: {
    code: JsonRpcErrorCodes.INVALID_REQUEST,
    message: "The JSON sent is not a valid Request object",
    statusCode: 400
  },
  METHOD_NOT_FOUND: {
    code: JsonRpcErrorCodes.METHOD_NOT_FOUND,
    message: "The method does not exist or is not available",
    statusCode: 404
  },
  INVALID_PARAMS: {
    code: JsonRpcErrorCodes.INVALID_PARAMS,
    message: "Invalid method parameter(s)",
    statusCode: 400
  },
  INTERNAL_ERROR: {
    code: JsonRpcErrorCodes.INTERNAL_ERROR,
    message: "Internal JSON-RPC error",
    statusCode: 500
  },
  // Application errors
  UNAUTHORIZED: {
    code: AppErrorCodes.UNAUTHORIZED,
    message: "Authentication required",
    statusCode: 401
  },
  FORBIDDEN: {
    code: AppErrorCodes.FORBIDDEN,
    message: "Access forbidden",
    statusCode: 403
  },
  API_KEY_INVALID: {
    code: AppErrorCodes.API_KEY_INVALID,
    message: "Invalid API key",
    statusCode: 401
  },
  API_KEY_EXPIRED: {
    code: AppErrorCodes.API_KEY_EXPIRED,
    message: "API key has expired",
    statusCode: 401
  },
  RATE_LIMIT_EXCEEDED: {
    code: AppErrorCodes.RATE_LIMIT_EXCEEDED,
    message: "Rate limit exceeded",
    statusCode: 429
  },
  QUOTA_EXCEEDED: {
    code: AppErrorCodes.QUOTA_EXCEEDED,
    message: "API quota exceeded",
    statusCode: 429
  },
  RESOURCE_NOT_FOUND: {
    code: AppErrorCodes.RESOURCE_NOT_FOUND,
    message: "Resource not found",
    statusCode: 404
  },
  RESOURCE_ALREADY_EXISTS: {
    code: AppErrorCodes.RESOURCE_ALREADY_EXISTS,
    message: "Resource already exists",
    statusCode: 409
  },
  RESOURCE_CONFLICT: {
    code: AppErrorCodes.RESOURCE_CONFLICT,
    message: "Resource conflict",
    statusCode: 409
  },
  VALIDATION_ERROR: {
    code: AppErrorCodes.VALIDATION_ERROR,
    message: "Validation failed",
    statusCode: 400
  },
  DATABASE_ERROR: {
    code: AppErrorCodes.DATABASE_ERROR,
    message: "Database operation failed",
    statusCode: 500
  },
  EXTERNAL_SERVICE_ERROR: {
    code: AppErrorCodes.EXTERNAL_SERVICE_ERROR,
    message: "External service error",
    statusCode: 502
  }
};
/**
 * Create a standardized MCPError
 */ export function createError(errorType, customMessage, data) {
  const definition = ErrorDefinitions[errorType];
  return new MCPError(definition.code, customMessage || definition.message, data, definition.statusCode);
}
/**
 * Error handler middleware for the registry
 */ export async function errorHandlerMiddleware(params, context, next) {
  try {
    return await next(params, context);
  } catch (error) {
    // If it's already an MCPError, re-throw it
    if (error instanceof MCPError) {
      throw error;
    }
    // Convert known error types
    if (error instanceof Error) {
      // Database errors
      if (error.message.includes("Database") || error.message.includes("SQL")) {
        throw createError("DATABASE_ERROR", error.message);
      }
      // Rate limiting
      if (error.message.includes("rate limit") || error.message.includes("Rate limit")) {
        throw createError("RATE_LIMIT_EXCEEDED", error.message);
      }
      // Not found
      if (error.message.includes("not found") || error.message.includes("Not found")) {
        throw createError("RESOURCE_NOT_FOUND", error.message);
      }
      // Validation
      if (error.message.includes("validation") || error.message.includes("Validation")) {
        throw createError("VALIDATION_ERROR", error.message);
      }
      // API key
      if (error.message.includes("API key") || error.message.includes("api key")) {
        throw createError("API_KEY_INVALID", error.message);
      }
      // Default to internal error
      throw createError("INTERNAL_ERROR", error.message);
    }
    // Unknown error type
    throw createError("INTERNAL_ERROR", "An unexpected error occurred");
  }
}
/**
 * Sanitize error messages to prevent information leakage
 */ export function sanitizeErrorMessage(message, isDevelopment = false) {
  if (isDevelopment) {
    return message; // Full messages in development
  }
  // List of patterns that might leak sensitive information
  const sensitivePatterns = [
    /column "[^"]+"/gi,
    /table "[^"]+"/gi,
    /at position \d+/gi,
    /near "[^"]+"/gi,
    /\/[^\/\s]+\/[^\/\s]+\//g,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
  ];
  let sanitized = message;
  for (const pattern of sensitivePatterns){
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}
/**
 * Create an error response with proper sanitization
 */ export function createErrorResponse(error, requestId, jsonrpc, isDevelopment = false) {
  const response = {
    error: {
      code: error instanceof MCPError ? error.code : JsonRpcErrorCodes.INTERNAL_ERROR,
      message: sanitizeErrorMessage(error.message, isDevelopment)
    }
  };
  if (error instanceof MCPError && error.data) {
    response.error.data = error.data;
  } else if (isDevelopment && !(error instanceof MCPError)) {
    // Include stack trace in development for non-MCPError errors
    response.error.data = {
      stack: error.stack,
      name: error.name
    };
  }
  if (requestId !== undefined) {
    response.id = requestId;
  }
  if (jsonrpc) {
    response.jsonrpc = jsonrpc;
  }
  return response;
}
/**
 * Extract error details for logging
 */ export function extractErrorDetails(error) {
  if (error instanceof MCPError) {
    return {
      code: error.code,
      message: error.message,
      stack: error.stack,
      data: error.data
    };
  }
  if (error instanceof Error) {
    return {
      code: JsonRpcErrorCodes.INTERNAL_ERROR,
      message: error.message,
      stack: error.stack
    };
  }
  return {
    code: JsonRpcErrorCodes.INTERNAL_ERROR,
    message: String(error)
  };
}
