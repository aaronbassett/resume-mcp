// MCP Request Handler
// Main handler that integrates validation, routing, and response formatting
import { validateRequest, isMethodSupported } from "./utils/validator.ts";
import { executeTool, hasHandler, use, loggingMiddleware, sanitizationMiddleware } from "./tools/registry.ts";
import { formatSuccess, sanitizeOutput } from "./utils/formatter.ts";
import { createError, createErrorResponse, errorHandlerMiddleware, extractErrorDetails } from "./utils/errors.ts";
import { analyticsMiddleware, Logger } from "./utils/analytics.ts";
import { addInjectionToResponse, parseInjectionResponse } from "./utils/injection.ts";
import { createAuthMiddleware } from "./middleware/auth.ts";
// Configure middleware
use(loggingMiddleware);
use(createAuthMiddleware());
use(sanitizationMiddleware);
use(errorHandlerMiddleware);
use(analyticsMiddleware);
/**
 * Main MCP request handler
 */ export async function handleMCPRequest(request, body) {
  // Store request globally for analytics middleware
  globalThis.currentRequest = request;
  // Extract request metadata
  const apiKey = request.headers.get("x-api-key") || undefined;
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  // Create logger for this request
  const logger = new Logger({
    requestId,
    apiKey: apiKey ? "present" : "missing"
  });
  // Build context object
  const context = {
    apiKey,
    apiKeyId: apiKey,
    requestId,
    timestamp
  };
  try {
    // Validate request structure
    const validationResult = validateRequest(body);
    if (!validationResult.valid) {
      const error = createError("INVALID_REQUEST", validationResult.message || "Invalid request", {
        errors: validationResult.errors
      });
      return createErrorResponse(error, body?.id, body?.jsonrpc);
    }
    const mcpRequest = body;
    const { method, params = {}, id } = mcpRequest;
    // Add method to context for analytics
    context.method = method;
    logger.info("Processing MCP request", {
      method,
      hasParams: !!params
    });
    // Check if method is supported by schema
    if (!isMethodSupported(method)) {
      const error = createError("METHOD_NOT_FOUND", `Method '${method}' is not supported`, {
        availableMethods: getPublicMethods()
      });
      return createErrorResponse(error, id, mcpRequest.jsonrpc);
    }
    // Check if handler is registered
    if (!hasHandler(method)) {
      const error = createError("INTERNAL_ERROR", `Method '${method}' is not implemented yet`);
      return createErrorResponse(error, id, mcpRequest.jsonrpc);
    }
    // Execute the tool
    let result = await executeTool(method, params, context);
    // Add injection detection if enabled
    if (context.apiKeyId) {
      result = await addInjectionToResponse(result, method, context.apiKeyId);
    }
    // Sanitize the result before returning
    const sanitizedResult = sanitizeOutput(result);
    logger.info("Request completed successfully", {
      method,
      responseTime: Date.now() - (context.startTime || Date.now())
    });
    // Format the response
    const response = formatSuccess(sanitizedResult, id, mcpRequest.jsonrpc);
    // Check if response contains injection attempt (for monitoring)
    if (context.apiKeyId && typeof response.result === "object") {
      const responseText = JSON.stringify(response.result);
      const injectionCheck = await parseInjectionResponse(responseText, context.apiKeyId, requestId);
      if (injectionCheck.detected) {
        logger.warn("Potential injection attempt detected", {
          method,
          transactionId: injectionCheck.transactionId,
          confidence: injectionCheck.confidence
        });
      }
    }
    // Return successful response
    return response;
  } catch (error) {
    // Log error details
    const errorDetails = extractErrorDetails(error);
    logger.error("Request failed", errorDetails);
    // Return appropriate error response
    return createErrorResponse(error, body?.id, body?.jsonrpc);
  }
}
/**
 * Get list of public methods (excluding internal ones)
 */ function getPublicMethods() {
  // This would be imported from validator in real implementation
  return [
    "get_profile_basics",
    "get_contact_info",
    "get_summary",
    "list_all_experiences",
    "get_experience_by_company",
    "get_experience_by_role",
    "get_recent_experience",
    "list_all_skills",
    "get_skills_by_category",
    "search_skills",
    "list_education",
    "get_highest_degree",
    "list_projects",
    "get_featured_projects",
    "search_projects_by_tech",
    "list_certifications",
    "get_active_certifications",
    "get_complete_resume",
    "generate_custom_resume",
    "track_view"
  ];
}
