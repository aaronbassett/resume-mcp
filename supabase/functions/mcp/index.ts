// import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts";
import { handleMCPRequest } from "./handler.ts";
import { createError, JsonRpcErrorCodes } from "./utils/errors.ts";
// Register all tool handlers
import { registerAllTools } from "./tools/index.ts";
registerAllTools();
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // Verify API key is present (actual verification will be in Task 5)
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      const error = createError("UNAUTHORIZED", "Missing API key in x-api-key header");
      return new Response(JSON.stringify({
        error: {
          code: error.code,
          message: error.message
        }
      }), {
        status: error.statusCode,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      const parseError = createError("PARSE_ERROR", "Invalid JSON in request body");
      return new Response(JSON.stringify({
        error: {
          code: parseError.code,
          message: parseError.message
        }
      }), {
        status: parseError.statusCode,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Handle the MCP request
    const response = await handleMCPRequest(req, body);
    // Determine status code based on error code
    let status = 200;
    if (response.error) {
      const errorCode = response.error.code;
      // JSON-RPC error codes
      if (typeof errorCode === "number") {
        switch(errorCode){
          case JsonRpcErrorCodes.PARSE_ERROR:
          case JsonRpcErrorCodes.INVALID_REQUEST:
          case JsonRpcErrorCodes.INVALID_PARAMS:
            status = 400;
            break;
          case JsonRpcErrorCodes.METHOD_NOT_FOUND:
            status = 404;
            break;
          default:
            status = 500;
        }
      } else {
        // Application-specific error codes
        switch(errorCode){
          case "UNAUTHORIZED":
          case "API_KEY_INVALID":
          case "API_KEY_EXPIRED":
            status = 401;
            break;
          case "FORBIDDEN":
            status = 403;
            break;
          case "RESOURCE_NOT_FOUND":
            status = 404;
            break;
          case "RESOURCE_ALREADY_EXISTS":
          case "RESOURCE_CONFLICT":
            status = 409;
            break;
          case "RATE_LIMIT_EXCEEDED":
          case "QUOTA_EXCEEDED":
            status = 429;
            break;
          case "VALIDATION_ERROR":
          case "INVALID_FORMAT":
          case "MISSING_REQUIRED_FIELD":
            status = 400;
            break;
          case "EXTERNAL_SERVICE_ERROR":
            status = 502;
            break;
          default:
            status = 500;
        }
      }
    }
    return new Response(JSON.stringify(response), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Unexpected error in MCP endpoint:", error);
    const internalError = createError("INTERNAL_ERROR", "An unexpected error occurred");
    return new Response(JSON.stringify({
      error: {
        code: internalError.code,
        message: internalError.message
      }
    }), {
      status: internalError.statusCode,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
