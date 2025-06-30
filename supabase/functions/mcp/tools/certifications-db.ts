// Certifications Tools - Database Implementation
// Database-backed implementations for certification-related MCP methods
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../utils/errors.ts";
import { getPermissionService } from "../services/permissions.ts";
import { withCache, withCacheInvalidation } from "../middleware/cache.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Check if user has permission to access private data
 */ async function canAccessPrivateData(apiKeyId, resumeId) {
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasWrite = await permissionService.checkPermission(apiKeyId, "resume", "write");
  const hasPrivateRead = await permissionService.checkPermission(apiKeyId, "resume", "read:private");
  return hasAdmin || hasWrite || hasPrivateRead;
}
/**
 * Check if a certification is currently active (not expired)
 */ function isCertificationActive(certification) {
  if (!certification.expiresAt) {
    return true; // No expiration date means it doesn't expire
  }
  return new Date(certification.expiresAt) > new Date();
}
// Certifications tool handlers
const handlers = {
  /**
   * List certifications with advanced filtering and pagination
   */ list_certifications: async (params, context)=>{
    const { resumeId, limit = 20, offset = 0, authority, category, isActive, expiringWithinDays, sortBy = "issuedAt", sortOrder = "desc", search } = params;
    // Validate pagination params
    if (limit < 1 || limit > 100) {
      throw createError("INVALID_PARAMS", "Limit must be between 1 and 100");
    }
    if (offset < 0) {
      throw createError("INVALID_PARAMS", "Offset must be non-negative");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has access to this resume
    if (context.resumeId && context.resumeId !== targetResumeId) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    // Check if user can access private data
    const includePrivate = await canAccessPrivateData(context.apiKeyId, targetResumeId);
    // Build query with count
    let countQuery = supabase.from("resume_blocks").select("block_id", {
      count: "exact"
    }).eq("resume_id", targetResumeId).eq("blocks.type", "certification");
    let query = supabase.from("resume_blocks").select(`
        position,
        blocks!inner(
          id,
          type,
          data,
          metadata,
          visibility,
          created_at,
          updated_at
        )
      `).eq("resume_id", targetResumeId).eq("blocks.type", "certification");
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
      countQuery = countQuery.neq("blocks.visibility", "private");
    }
    // Apply filters
    if (authority) {
      query = query.ilike("blocks.data->authority", `%${authority}%`);
      countQuery = countQuery.ilike("blocks.data->authority", `%${authority}%`);
    }
    if (category) {
      query = query.ilike("blocks.data->category", `%${category}%`);
      countQuery = countQuery.ilike("blocks.data->category", `%${category}%`);
    }
    // Handle active/expired filter
    if (isActive !== undefined) {
      const now = new Date().toISOString();
      if (isActive) {
        // Active: no expiration date OR expiration date in the future
        query = query.or(`blocks.data->expiresAt.is.null,blocks.data->expiresAt.gt.${now}`);
        countQuery = countQuery.or(`blocks.data->expiresAt.is.null,blocks.data->expiresAt.gt.${now}`);
      } else {
        // Expired: has expiration date AND it's in the past
        query = query.lt("blocks.data->expiresAt", now);
        countQuery = countQuery.lt("blocks.data->expiresAt", now);
      }
    }
    // Handle expiring within X days filter
    if (expiringWithinDays !== undefined) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiringWithinDays);
      const futureDateISO = futureDate.toISOString();
      query = query.lte("blocks.data->expiresAt", futureDateISO);
      countQuery = countQuery.lte("blocks.data->expiresAt", futureDateISO);
    }
    // Apply search across multiple fields
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`blocks.data->name.ilike.${searchTerm},blocks.data->authority.ilike.${searchTerm},blocks.data->category.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
      countQuery = countQuery.or(`blocks.data->name.ilike.${searchTerm},blocks.data->authority.ilike.${searchTerm},blocks.data->category.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
    }
    // Apply sorting
    const ascending = sortOrder === "asc";
    switch(sortBy){
      case "issuedAt":
        query = query.order("blocks.data->issuedAt", {
          ascending
        });
        break;
      case "expiresAt":
        query = query.order("blocks.data->expiresAt", {
          ascending
        });
        break;
      case "name":
        query = query.order("blocks.data->name", {
          ascending
        });
        break;
      case "authority":
        query = query.order("blocks.data->authority", {
          ascending
        });
        break;
      case "created_at":
        query = query.order("blocks.created_at", {
          ascending
        });
        break;
      default:
        query = query.order("blocks.data->issuedAt", {
          ascending: false
        });
    }
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    // Execute queries
    const [{ data: certificationData, error: dataError }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);
    if (dataError) {
      console.error("Error fetching certification data:", dataError);
      throw createError("DATABASE_ERROR", "Failed to fetch certifications");
    }
    if (countError) {
      console.error("Error counting certifications:", countError);
      throw createError("DATABASE_ERROR", "Failed to count certifications");
    }
    const certifications = certificationData || [];
    const totalCount = count || 0;
    // Format certifications and add active status
    const formattedCertifications = certifications.map((item)=>{
      const certData = {
        ...item.blocks.data
      };
      const isCurrentlyActive = isCertificationActive(certData);
      return {
        id: item.blocks.id,
        position: item.position,
        ...certData,
        isActive: isCurrentlyActive,
        daysUntilExpiration: certData.expiresAt ? Math.ceil((new Date(certData.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
        metadata: {
          visibility: item.blocks.visibility,
          created_at: item.blocks.created_at,
          updated_at: item.blocks.updated_at
        }
      };
    });
    // Calculate summary statistics
    const activeCerts = formattedCertifications.filter((cert)=>cert.isActive);
    const expiredCerts = formattedCertifications.filter((cert)=>!cert.isActive);
    const expiringIn30Days = formattedCertifications.filter((cert)=>cert.daysUntilExpiration !== null && cert.daysUntilExpiration <= 30 && cert.daysUntilExpiration > 0);
    return {
      type: "certifications",
      data: formattedCertifications,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + certifications.length < totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        authority,
        category,
        isActive,
        expiringWithinDays,
        search,
        sortBy,
        sortOrder
      },
      count: certifications.length,
      totalCount,
      summary: {
        total: totalCount,
        active: activeCerts.length,
        expired: expiredCerts.length,
        expiringIn30Days: expiringIn30Days.length
      }
    };
  },
  /**
   * Get active certifications only
   */ get_active_certifications: async (params, context)=>{
    const { resumeId, limit = 20, offset = 0, sortBy = "expiresAt", sortOrder = "asc" } = params;
    // Use the main list function with active filter
    return await handlers.list_certifications({
      resumeId,
      isActive: true,
      limit,
      offset,
      sortBy,
      sortOrder
    }, context);
  },
  /**
   * Get certifications expiring soon
   */ get_expiring_certifications: async (params, context)=>{
    const { resumeId, days = 90, limit = 20, offset = 0 } = params;
    // Use the main list function with expiring filter
    return await handlers.list_certifications({
      resumeId,
      expiringWithinDays: days,
      isActive: true,
      limit,
      offset,
      sortBy: "expiresAt",
      sortOrder: "asc"
    }, context);
  },
  /**
   * Create a new certification entry
   */ create_certification: async (params, context)=>{
    const { resumeId, name, authority, category, issuedAt, expiresAt, credentialId, credentialUrl, description, skills, visibility = "public" } = params;
    // Validate required fields
    if (!name || !authority || !issuedAt) {
      throw createError("INVALID_PARAMS", "Name, authority, and issued date are required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "certification", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to create certifications");
    }
    const timestamp = new Date().toISOString();
    try {
      // Create certification data
      const certificationData = {
        name,
        authority,
        category,
        issuedAt,
        expiresAt,
        credentialId,
        credentialUrl,
        description,
        skills: skills || []
      };
      // Create new certification block
      const { data: newBlock, error: createBlockError } = await supabase.from("blocks").insert({
        type: "certification",
        data: certificationData,
        visibility,
        user_id: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (createBlockError || !newBlock) {
        throw createBlockError || new Error("Failed to create certification block");
      }
      // Get current max position
      const { data: maxPosData } = await supabase.from("resume_blocks").select("position").eq("resume_id", targetResumeId).order("position", {
        ascending: false
      }).limit(1);
      const nextPosition = maxPosData && maxPosData.length > 0 ? maxPosData[0].position + 1 : 0;
      // Link to resume
      const { error: linkError } = await supabase.from("resume_blocks").insert({
        resume_id: targetResumeId,
        block_id: newBlock.id,
        position: nextPosition
      });
      if (linkError) {
        throw linkError;
      }
      return {
        type: "success",
        message: "Certification created successfully",
        data: {
          id: newBlock.id,
          ...certificationData,
          isActive: isCertificationActive(certificationData)
        }
      };
    } catch (error) {
      console.error("Failed to create certification:", error);
      throw createError("DATABASE_ERROR", "Failed to create certification");
    }
  },
  /**
   * Update certification entry
   */ update_certification: async (params, context)=>{
    const { certificationId, resumeId, name, authority, category, issuedAt, expiresAt, credentialId, credentialUrl, description, skills } = params;
    if (!certificationId) {
      throw createError("INVALID_PARAMS", "Certification ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "certification", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to update certifications");
    }
    // Verify certification belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("blocks!inner(id, data)").eq("resume_id", targetResumeId).eq("blocks.id", certificationId).eq("blocks.type", "certification").single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Certification not found");
    }
    // Update certification data
    const currentData = existingBlock.blocks.data || {};
    const updatedData = {
      ...currentData,
      ...name !== undefined && {
        name
      },
      ...authority !== undefined && {
        authority
      },
      ...category !== undefined && {
        category
      },
      ...issuedAt !== undefined && {
        issuedAt
      },
      ...expiresAt !== undefined && {
        expiresAt
      },
      ...credentialId !== undefined && {
        credentialId
      },
      ...credentialUrl !== undefined && {
        credentialUrl
      },
      ...description !== undefined && {
        description
      },
      ...skills !== undefined && {
        skills
      }
    };
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase.from("blocks").update({
      data: updatedData,
      updated_at: timestamp
    }).eq("id", certificationId);
    if (updateError) {
      throw createError("DATABASE_ERROR", "Failed to update certification");
    }
    return {
      type: "success",
      message: "Certification updated successfully",
      data: {
        id: certificationId,
        ...updatedData,
        isActive: isCertificationActive(updatedData)
      }
    };
  },
  /**
   * Delete certification entry
   */ delete_certification: async (params, context)=>{
    const { certificationId, resumeId } = params;
    if (!certificationId) {
      throw createError("INVALID_PARAMS", "Certification ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "certification", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to delete certifications");
    }
    // Verify certification belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("block_id").eq("resume_id", targetResumeId).eq("block_id", certificationId).single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Certification not found");
    }
    // Delete the link first
    const { error: unlinkError } = await supabase.from("resume_blocks").delete().eq("resume_id", targetResumeId).eq("block_id", certificationId);
    if (unlinkError) {
      throw createError("DATABASE_ERROR", "Failed to unlink certification");
    }
    // Delete the block
    const { error: deleteError } = await supabase.from("blocks").delete().eq("id", certificationId);
    if (deleteError) {
      throw createError("DATABASE_ERROR", "Failed to delete certification");
    }
    return {
      type: "success",
      message: "Certification deleted successfully"
    };
  }
};
// Export handlers with caching applied
export const cachedHandlers = {
  // Read operations with caching
  list_certifications: withCache("list_certifications", handlers.list_certifications),
  get_active_certifications: withCache("get_active_certifications", handlers.get_active_certifications),
  get_expiring_certifications: withCache("get_expiring_certifications", handlers.get_expiring_certifications),
  // Mutation operations with cache invalidation
  create_certification: withCacheInvalidation("create_certification", handlers.create_certification),
  update_certification: withCacheInvalidation("update_certification", handlers.update_certification),
  delete_certification: withCacheInvalidation("delete_certification", handlers.delete_certification)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
