import { supabase } from './supabase';
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';
import type { 
  ApiKey, 
  CreateApiKeyData, 
  UpdateApiKeyData, 
  ApiKeyWithResume,
  ApiKeyScope,
  ApiKeyRotation,
  ApiUsageLog,
  ApiKeyWebhook
} from '../types/apiKeys';

// Generate a secure API key
const generateApiKey = (): string => {
  // Format: mcp_[random string]
  return `mcp_${nanoid(32)}`;
};

// Hash an API key for secure storage
const hashApiKey = (key: string): string => {
  return sha256(key);
};

// Create a new API key
export const createApiKey = async (data: CreateApiKeyData): Promise<{ data: ApiKey | null; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyFirstChars = apiKey.substring(0, 8);
    const keyLastChars = apiKey.substring(apiKey.length - 4);

    // For admin keys, set resume_id to null
    const resumeId = data.is_admin ? null : data.resume_id;

    // Default permissions based on admin status
    const permissions = data.permissions || (data.is_admin 
      ? ['read', 'write', 'delete', 'admin'] 
      : ['read']);

    // Default rate limit
    const rateLimit = data.rate_limit || (data.is_admin ? 10000 : 1000);

    // Calculate next rotation date if policy is set
    let nextRotationDate = null;
    if (data.rotation_policy) {
      const now = new Date();
      switch (data.rotation_policy) {
        case 'monthly':
          nextRotationDate = new Date(now.setMonth(now.getMonth() + 1));
          break;
        case 'quarterly':
          nextRotationDate = new Date(now.setMonth(now.getMonth() + 3));
          break;
        case 'yearly':
          nextRotationDate = new Date(now.setFullYear(now.getFullYear() + 1));
          break;
      }
    }

    const keyData = {
      key: apiKey, // Store full key temporarily for return value
      key_hash: keyHash,
      key_first_chars: keyFirstChars,
      key_last_chars: keyLastChars,
      user_id: user.id,
      resume_id: resumeId,
      name: data.name,
      is_admin: data.is_admin,
      expires_at: data.expires_at || null,
      max_uses: data.max_uses || null,
      notes: data.notes || null,
      
      // Enhanced fields
      key_version: 1,
      encryption_key_version: 1,
      rotation_policy: data.rotation_policy || null,
      next_rotation_date: nextRotationDate ? nextRotationDate.toISOString() : null,
      ip_whitelist: data.ip_whitelist || null,
      user_agent_pattern: data.user_agent_pattern || null,
      permissions,
      rate_limit: rateLimit,
      metadata: data.metadata || {}
    };

    const { data: createdKey, error } = await supabase
      .from('api_keys')
      .insert(keyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return { data: null, error: error.message };
    }

    return { data: createdKey, error: null };
  } catch (error) {
    console.error('Error creating API key:', error);
    return { data: null, error: 'Failed to create API key' };
  }
};

// Get all API keys for current user
export const getUserApiKeys = async (): Promise<{ data: ApiKeyWithResume[] | null; error: string | null }> => {
  try {
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select(`
        *,
        resume:resume_id (
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return { data: null, error: error.message };
    }

    return { data: keys || [], error: null };
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return { data: null, error: 'Failed to fetch API keys' };
  }
};

// Get API key by ID
export const getApiKey = async (keyId: string): Promise<{ data: ApiKey | null; error: string | null }> => {
  try {
    const { data: key, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .single();

    if (error) {
      console.error('Error fetching API key:', error);
      return { data: null, error: error.message };
    }

    return { data: key, error: null };
  } catch (error) {
    console.error('Error fetching API key:', error);
    return { data: null, error: 'Failed to fetch API key' };
  }
};

// Update an API key
export const updateApiKey = async (
  keyId: string, 
  data: UpdateApiKeyData
): Promise<{ data: ApiKey | null; error: string | null }> => {
  try {
    const { data: key, error } = await supabase
      .from('api_keys')
      .update(data)
      .eq('id', keyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating API key:', error);
      return { data: null, error: error.message };
    }

    return { data: key, error: null };
  } catch (error) {
    console.error('Error updating API key:', error);
    return { data: null, error: 'Failed to update API key' };
  }
};

// Revoke an API key
export const revokeApiKey = async (keyId: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_revoked: true })
      .eq('id', keyId);

    if (error) {
      console.error('Error revoking API key:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error revoking API key:', error);
    return { error: 'Failed to revoke API key' };
  }
};

// Delete an API key
export const deleteApiKey = async (keyId: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (error) {
      console.error('Error deleting API key:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return { error: 'Failed to delete API key' };
  }
};

// Rotate an API key
export const rotateApiKey = async (keyId: string, reason: 'scheduled' | 'manual' | 'security' | 'compromised' = 'manual'): Promise<{ data: { newKey: string } | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .rpc('rotate_api_key', {
        p_api_key_id: keyId,
        p_reason: reason
      });

    if (error) {
      console.error('Error rotating API key:', error);
      return { data: null, error: error.message };
    }

    if (!data || !data.new_api_key) {
      return { data: null, error: 'Failed to rotate API key' };
    }

    return { data: { newKey: data.new_api_key }, error: null };
  } catch (error) {
    console.error('Error rotating API key:', error);
    return { data: null, error: 'Failed to rotate API key' };
  }
};

// Get API key scopes
export const getApiKeyScopes = async (): Promise<{ data: ApiKeyScope[] | null; error: string | null }> => {
  try {
    const { data: scopes, error } = await supabase
      .from('api_key_scopes')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching API key scopes:', error);
      return { data: null, error: error.message };
    }

    return { data: scopes || [], error: null };
  } catch (error) {
    console.error('Error fetching API key scopes:', error);
    return { data: null, error: 'Failed to fetch API key scopes' };
  }
};

// Get API key rotations
export const getApiKeyRotations = async (keyId: string): Promise<{ data: ApiKeyRotation[] | null; error: string | null }> => {
  try {
    const { data: rotations, error } = await supabase
      .from('api_key_rotations')
      .select('*')
      .eq('api_key_id', keyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API key rotations:', error);
      return { data: null, error: error.message };
    }

    return { data: rotations || [], error: null };
  } catch (error) {
    console.error('Error fetching API key rotations:', error);
    return { data: null, error: 'Failed to fetch API key rotations' };
  }
};

// Get API key usage logs
export const getApiKeyUsageLogs = async (
  keyId: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ data: ApiUsageLog[] | null; error: string | null }> => {
  try {
    const { data: logs, error } = await supabase
      .from('api_usage_logs')
      .select('*')
      .eq('api_key_id', keyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching API key usage logs:', error);
      return { data: null, error: error.message };
    }

    return { data: logs || [], error: null };
  } catch (error) {
    console.error('Error fetching API key usage logs:', error);
    return { data: null, error: 'Failed to fetch API key usage logs' };
  }
};

// Create a webhook for API key events
export const createApiKeyWebhook = async (
  webhookUrl: string,
  events: string[]
): Promise<{ data: ApiKeyWebhook | null; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Generate a secret for webhook signature verification
    const secret = nanoid(32);
    const secretHash = sha256(secret);

    const { data: webhook, error } = await supabase
      .from('api_key_webhooks')
      .insert({
        user_id: user.id,
        webhook_url: webhookUrl,
        events,
        secret_hash: secretHash
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating webhook:', error);
      return { data: null, error: error.message };
    }

    // Return webhook with the plain text secret (only time it's available)
    return { 
      data: { 
        ...webhook, 
        secret 
      } as any, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating webhook:', error);
    return { data: null, error: 'Failed to create webhook' };
  }
};

// Update a webhook
export const updateApiKeyWebhook = async (
  webhookId: string,
  data: {
    webhook_url?: string;
    events?: string[];
    is_active?: boolean;
  }
): Promise<{ data: ApiKeyWebhook | null; error: string | null }> => {
  try {
    const { data: webhook, error } = await supabase
      .from('api_key_webhooks')
      .update(data)
      .eq('id', webhookId)
      .select()
      .single();

    if (error) {
      console.error('Error updating webhook:', error);
      return { data: null, error: error.message };
    }

    return { data: webhook, error: null };
  } catch (error) {
    console.error('Error updating webhook:', error);
    return { data: null, error: 'Failed to update webhook' };
  }
};

// Delete a webhook
export const deleteApiKeyWebhook = async (webhookId: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('api_key_webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('Error deleting webhook:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return { error: 'Failed to delete webhook' };
  }
};

// Validate an API key (for client-side validation)
export const validateApiKey = async (
  apiKey: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ 
  isValid: boolean; 
  apiKeyId?: string; 
  userId?: string; 
  resumeId?: string; 
  permissions?: string[]; 
  message?: string;
}> => {
  try {
    const { data, error } = await supabase
      .rpc('validate_api_key', {
        p_api_key: apiKey,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

    if (error) {
      console.error('Error validating API key:', error);
      return { isValid: false, message: error.message };
    }

    if (!data || !data.is_valid) {
      return { isValid: false, message: data?.message || 'Invalid API key' };
    }

    return { 
      isValid: true, 
      apiKeyId: data.api_key_id, 
      userId: data.user_id, 
      resumeId: data.resume_id,
      permissions: data.permissions,
      message: data.message
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { isValid: false, message: 'Failed to validate API key' };
  }
};

// Check if an API key has a specific permission
export const checkApiKeyPermission = async (
  apiKeyId: string,
  resource: string,
  action: string
): Promise<{ hasPermission: boolean; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .rpc('check_api_key_permission', {
        p_api_key_id: apiKeyId,
        p_resource: resource,
        p_action: action
      });

    if (error) {
      console.error('Error checking API key permission:', error);
      return { hasPermission: false, error: error.message };
    }

    return { hasPermission: !!data, error: null };
  } catch (error) {
    console.error('Error checking API key permission:', error);
    return { hasPermission: false, error: 'Failed to check API key permission' };
  }
};