// MCP Request validation utilities
// Validates incoming requests against the MCP protocol specification
// MCP method definitions with parameter schemas
const METHOD_SCHEMAS = {
  // Profile methods
  get_profile_basics: {
    description: "Get basic profile information",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  get_contact_info: {
    description: "Get contact information",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  get_summary: {
    description: "Get profile summary",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  // Experience methods
  list_all_experiences: {
    description: "List all experience entries",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      },
      limit: {
        type: "number",
        minimum: 1,
        maximum: 100
      },
      offset: {
        type: "number",
        minimum: 0
      }
    }
  },
  get_experience_by_company: {
    description: "Get experience for a specific company",
    params: {
      company: {
        type: "string",
        required: true,
        minLength: 1
      },
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  get_experience_by_role: {
    description: "Get experience by role/position",
    params: {
      role: {
        type: "string",
        required: true,
        minLength: 1
      },
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  get_recent_experience: {
    description: "Get most recent experience entries",
    params: {
      count: {
        type: "number",
        minimum: 1,
        maximum: 10
      },
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  // Skills methods
  list_all_skills: {
    description: "List all skills",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  get_skills_by_category: {
    description: "Get skills filtered by category",
    params: {
      category: {
        type: "string",
        required: true,
        minLength: 1
      },
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  search_skills: {
    description: "Search for specific skills",
    params: {
      query: {
        type: "string",
        required: true,
        minLength: 1
      },
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  // Education methods
  list_education: {
    description: "List all education entries",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  get_highest_degree: {
    description: "Get highest degree obtained",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  // Projects methods
  list_projects: {
    description: "List all projects",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      },
      featured: {
        type: "boolean",
        description: "Filter by featured status"
      }
    }
  },
  get_featured_projects: {
    description: "Get featured projects only",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  search_projects_by_tech: {
    description: "Search projects by technology",
    params: {
      technology: {
        type: "string",
        required: true,
        minLength: 1
      },
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  // Certification methods
  list_certifications: {
    description: "List all certifications",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      },
      active: {
        type: "boolean",
        description: "Filter by active status"
      }
    }
  },
  get_active_certifications: {
    description: "Get currently active certifications",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  // Full resume methods
  get_complete_resume: {
    description: "Get complete resume data",
    params: {
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      },
      format: {
        type: "string",
        enum: [
          "json",
          "markdown",
          "text"
        ]
      }
    }
  },
  generate_custom_resume: {
    description: "Generate a customized resume",
    params: {
      blocks: {
        type: "array",
        required: true,
        description: "Array of block IDs to include"
      },
      resumeId: {
        type: "string",
        description: "Optional resume ID"
      }
    }
  },
  // Analytics methods
  track_view: {
    description: "Track a resume view event",
    params: {
      resumeId: {
        type: "string",
        required: true
      },
      source: {
        type: "string",
        description: "Source of the view"
      },
      metadata: {
        type: "object",
        description: "Additional metadata"
      }
    }
  }
};
/**
 * Validates an MCP request
 */ export function validateRequest(body) {
  const errors = [];
  // Check if body is an object
  if (!body || typeof body !== "object") {
    return {
      valid: false,
      message: "Request body must be a JSON object",
      errors: [
        {
          field: "body",
          message: "Invalid request body"
        }
      ]
    };
  }
  const request = body;
  // Validate jsonrpc field (optional but if present must be "2.0")
  if ("jsonrpc" in request && request.jsonrpc !== "2.0") {
    errors.push({
      field: "jsonrpc",
      message: "JSON-RPC version must be '2.0' if specified",
      value: request.jsonrpc
    });
  }
  // Validate method field (required)
  if (!request.method || typeof request.method !== "string") {
    errors.push({
      field: "method",
      message: "Method is required and must be a string",
      value: request.method
    });
  } else if (request.method.trim().length === 0) {
    errors.push({
      field: "method",
      message: "Method cannot be empty",
      value: request.method
    });
  }
  // Validate params field (optional but must be object if present)
  if ("params" in request && request.params !== null && request.params !== undefined) {
    if (typeof request.params !== "object" || Array.isArray(request.params)) {
      errors.push({
        field: "params",
        message: "Params must be an object if provided",
        value: request.params
      });
    }
  }
  // Validate id field (optional but must be string, number, or null if present)
  if ("id" in request && request.id !== null && request.id !== undefined) {
    if (typeof request.id !== "string" && typeof request.id !== "number") {
      errors.push({
        field: "id",
        message: "ID must be a string, number, or null if provided",
        value: request.id
      });
    }
  }
  // Return early if basic structure validation failed
  if (errors.length > 0) {
    return {
      valid: false,
      message: "Request validation failed",
      errors
    };
  }
  // Validate method-specific parameters
  if (request.method && METHOD_SCHEMAS[request.method]) {
    const schema = METHOD_SCHEMAS[request.method];
    const params = request.params || {};
    if (schema.params) {
      // Check each parameter defined in the schema
      for (const [paramName, paramSchema] of Object.entries(schema.params)){
        const value = params[paramName];
        // Check required parameters
        if (paramSchema.required && (value === undefined || value === null)) {
          errors.push({
            field: `params.${paramName}`,
            message: `Parameter '${paramName}' is required`,
            value
          });
          continue;
        }
        // Skip validation if parameter is not provided and not required
        if (value === undefined || value === null) {
          continue;
        }
        // Type validation
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== paramSchema.type) {
          errors.push({
            field: `params.${paramName}`,
            message: `Parameter '${paramName}' must be of type ${paramSchema.type}`,
            value
          });
          continue;
        }
        // String-specific validations
        if (paramSchema.type === "string" && typeof value === "string") {
          if (paramSchema.minLength !== undefined && value.length < paramSchema.minLength) {
            errors.push({
              field: `params.${paramName}`,
              message: `Parameter '${paramName}' must be at least ${paramSchema.minLength} characters`,
              value
            });
          }
          if (paramSchema.maxLength !== undefined && value.length > paramSchema.maxLength) {
            errors.push({
              field: `params.${paramName}`,
              message: `Parameter '${paramName}' must be at most ${paramSchema.maxLength} characters`,
              value
            });
          }
          if (paramSchema.enum && !paramSchema.enum.includes(value)) {
            errors.push({
              field: `params.${paramName}`,
              message: `Parameter '${paramName}' must be one of: ${paramSchema.enum.join(", ")}`,
              value
            });
          }
        }
        // Number-specific validations
        if (paramSchema.type === "number" && typeof value === "number") {
          if (paramSchema.minimum !== undefined && value < paramSchema.minimum) {
            errors.push({
              field: `params.${paramName}`,
              message: `Parameter '${paramName}' must be at least ${paramSchema.minimum}`,
              value
            });
          }
          if (paramSchema.maximum !== undefined && value > paramSchema.maximum) {
            errors.push({
              field: `params.${paramName}`,
              message: `Parameter '${paramName}' must be at most ${paramSchema.maximum}`,
              value
            });
          }
        }
      }
    }
  }
  return {
    valid: errors.length === 0,
    message: errors.length > 0 ? "Request validation failed" : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}
/**
 * Get list of available methods
 */ export function getAvailableMethods() {
  return Object.keys(METHOD_SCHEMAS);
}
/**
 * Check if a method exists
 */ export function isMethodSupported(method) {
  return method in METHOD_SCHEMAS;
}
/**
 * Get method schema
 */ export function getMethodSchema(method) {
  return METHOD_SCHEMAS[method];
}
