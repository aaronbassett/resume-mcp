// MCP Response Formatter
// Utilities for formatting responses according to MCP specification
/**
 * Format a successful response
 */ export function formatSuccess(result, id, jsonrpc) {
  const response = {
    result
  };
  if (id !== undefined) {
    response.id = id;
  }
  if (jsonrpc) {
    response.jsonrpc = jsonrpc;
  }
  return response;
}
/**
 * Format an error response
 */ export function formatError(code, message, data, id, jsonrpc) {
  const response = {
    error: {
      code,
      message
    }
  };
  if (data !== undefined) {
    response.error.data = data;
  }
  if (id !== undefined) {
    response.id = id;
  }
  if (jsonrpc) {
    response.jsonrpc = jsonrpc;
  }
  return response;
}
/**
 * Format a paginated result
 */ export function formatPaginated(items, total, page, pageSize) {
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total
  };
}
/**
 * Format resource listings (for MCP resource discovery)
 */ export function formatResourceList(resources) {
  return {
    result: {
      resources
    }
  };
}
/**
 * Format tool listings (for MCP tool discovery)
 */ export function formatToolList(tools) {
  return {
    result: {
      tools
    }
  };
}
/**
 * Sanitize output to prevent sensitive data leakage
 */ export function sanitizeOutput(data) {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data !== "object") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }
  const sanitized = {};
  for (const [key, value] of Object.entries(data)){
    // Skip fields that might contain sensitive data
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("password") || lowerKey.includes("secret") || lowerKey.includes("token") || lowerKey.includes("key") || lowerKey.includes("auth") || key.startsWith("_") // Private convention
    ) {
      continue;
    }
    // Recursively sanitize nested objects
    sanitized[key] = sanitizeOutput(value);
  }
  return sanitized;
}
/**
 * Format a batch response (multiple results)
 */ export function formatBatch(results) {
  return results.map(({ id, result, error })=>{
    if (error) {
      return formatError(error.code, error.message, error.data, id);
    } else {
      return formatSuccess(result, id);
    }
  });
}
/**
 * Wrap data in MCP envelope format
 */ export function wrapInEnvelope(data, metadata) {
  const envelope = {
    data
  };
  if (metadata) {
    envelope.metadata = metadata;
  }
  return envelope;
}
/**
 * Format resume-specific responses
 */ export const ResumeFormatters = {
  /**
   * Format a profile response
   */ profile: (profile)=>{
    return {
      type: "profile",
      data: profile
    };
  },
  /**
   * Format experience entries
   */ experiences: (experiences)=>{
    return {
      type: "experiences",
      count: experiences.length,
      items: experiences.map((exp)=>({
          ...exp,
          duration: calculateDuration(exp.startDate, exp.endDate || "present")
        }))
    };
  },
  /**
   * Format skills by category
   */ skills: (skillsByCategory)=>{
    const allSkills = Object.values(skillsByCategory).flat();
    return {
      type: "skills",
      totalCount: allSkills.length,
      categoryCount: Object.keys(skillsByCategory).length,
      categories: skillsByCategory
    };
  },
  /**
   * Format complete resume
   */ completeResume: (resume, format = "json")=>{
    if (format === "json") {
      return resume;
    }
    // TODO: Implement markdown and text formatters
    return {
      type: "formatted_resume",
      format,
      content: "Formatting not yet implemented"
    };
  }
};
/**
 * Calculate duration between dates
 */ function calculateDuration(startDate, endDate) {
  if (endDate === "present") {
    endDate = new Date().toISOString().slice(0, 7); // YYYY-MM format
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years > 0 && remainingMonths > 0) {
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else {
    return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
}
