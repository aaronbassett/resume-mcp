// MCP Tools Index
// Central registration of all MCP tool implementations
import { registerTools } from "./registry.ts";
// Import database-backed implementations when available
import { handlers as profileHandlersDB } from "./profile-db.ts";
import { handlers as experienceHandlersDB } from "./experience-db.ts";
import { handlers as projectsHandlersDB } from "./projects-db.ts";
import { handlers as skillsHandlersDB } from "./skills-db.ts";
import { handlers as educationHandlersDB } from "./education-db.ts";
import { handlers as certificationsHandlersDB } from "./certifications-db.ts";
import { handlers as aiHandlers } from "./ai.ts";
// Import mock implementations as fallback
import { handlers as profileHandlersMock } from "./profile.ts";
import { handlers as experienceHandlersMock } from "./experience.ts";
import { handlers as projectsHandlersMock } from "./projects.ts";
import { handlers as skillsHandlersMock } from "./skills.ts";
import { handlers as educationHandlersMock } from "./education.ts";
import { handlers as certificationsHandlersMock } from "./certifications.ts";
import { handlers as resumeHandlers } from "./resume.ts";
import { handlers as analyticsHandlers } from "./analytics.ts";
// Import admin handlers
import { handlers as adminApiKeyHandlers } from "./admin/api-keys.ts";
import { handlers as adminResumeHandlers } from "./admin/resumes.ts";
import { handlers as adminBlockHandlers } from "./admin/blocks.ts";
import { handlers as adminCompositionHandlers } from "./admin/resume-composition.ts";
import { handlers as adminAnalyticsHandlers } from "./admin/analytics.ts";
import { handlers as adminInjectionHandlers } from "./admin/injection-detection.ts";
import { handlers as cacheManagerHandlers } from "./cache-manager.ts";
// Feature flag for database mode
const USE_DATABASE = Deno.env.get("USE_DATABASE") !== "false";
/**
 * Register all MCP tool handlers
 * This function should be called once during initialization
 */ export function registerAllTools() {
  // Register handlers based on mode
  if (USE_DATABASE) {
    console.log("Registering database-backed MCP tools");
    registerTools(profileHandlersDB);
    registerTools(experienceHandlersDB);
    registerTools(projectsHandlersDB);
    registerTools(skillsHandlersDB);
    registerTools(educationHandlersDB);
    registerTools(certificationsHandlersDB);
  } else {
    console.log("Registering mock MCP tools");
    registerTools(profileHandlersMock);
    registerTools(experienceHandlersMock);
    registerTools(projectsHandlersMock);
    registerTools(skillsHandlersMock);
    registerTools(educationHandlersMock);
    registerTools(certificationsHandlersMock);
  }
  // Register other handlers
  registerTools(resumeHandlers);
  registerTools(analyticsHandlers);
  registerTools(aiHandlers);
  // Register admin handlers
  registerTools(adminApiKeyHandlers);
  registerTools(adminResumeHandlers);
  registerTools(adminBlockHandlers);
  registerTools(adminCompositionHandlers);
  registerTools(adminAnalyticsHandlers);
  registerTools(adminInjectionHandlers);
  registerTools(cacheManagerHandlers);
  console.log("MCP tools registered successfully");
}
/**
 * Get a list of all registered tool names
 */ export function getRegisteredTools() {
  return [
    // Profile tools
    "get_profile_basics",
    "get_contact_info",
    "get_summary",
    // Experience tools
    "list_all_experiences",
    "get_experience_by_company",
    "get_experience_details",
    "create_experience",
    "update_experience",
    "delete_experience",
    // Skills tools
    "list_all_skills",
    "get_skills_by_category",
    "search_skills",
    "create_skill",
    "update_skill",
    "delete_skill",
    // Education tools
    "list_education",
    "get_highest_degree",
    "create_education",
    // Projects tools
    "list_projects",
    "get_projects_by_technology",
    "get_featured_projects",
    "get_project_details",
    // Certifications tools
    "list_certifications",
    "get_active_certifications",
    "get_expiring_certifications",
    "create_certification",
    "update_certification",
    "delete_certification",
    // Resume tools
    "get_complete_resume",
    "generate_custom_resume",
    // Analytics tools
    "track_view",
    // AI-powered tools
    "generate_summary",
    "find_relevant_experience",
    // Admin tools (API key management)
    "create_api_key",
    "list_api_keys",
    "update_api_key",
    "revoke_api_key",
    "rotate_api_key",
    "get_api_key_stats",
    "verify_api_key_permissions",
    // Cache management tools
    "get_cache_stats",
    "clear_resume_cache",
    "clear_all_cache",
    "get_cache_config",
    // Resume management tools
    "create_resume",
    "get_resume",
    "list_resumes",
    "update_resume",
    "delete_resume",
    "duplicate_resume",
    // Block management tools
    "create_block",
    "get_block",
    "list_blocks",
    "update_block",
    "delete_block",
    "duplicate_block",
    // Resume composition tools
    "add_block_to_resume",
    "remove_block_from_resume",
    "reorder_resume_blocks",
    "bulk_reorder_blocks",
    "clear_resume_blocks",
    // Analytics tools
    "get_usage_stats",
    "get_block_performance",
    "detect_suspicious_activity",
    "get_llm_usage",
    "get_dashboard_metrics",
    // Injection detection tools
    "list_injection_captures",
    "get_injection_capture",
    "review_injection_capture",
    "get_injection_stats",
    "configure_injection_detection"
  ];
}
