import { supabase } from './supabase';
import { nanoid } from 'nanoid';
import { sha256 } from 'js-sha256';
import type { ApiKey, CreateApiKeyData, UpdateApiKeyData, ApiKeyWithResume } from '../types/apiKeys';

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
    const keyFirstChars = apiKey.substring(0, 4);
    const keyLastChars = apiKey.substring(apiKey.length - 4);

    // For admin keys, set resume_id to null
    const resumeId = data.is_admin ? null : data.resume_id;

    // For admin keys, ensure expiration is set (max 3 months)
    let expiresAt = data.expires_at;
    if (data.is_admin) {
      const maxExpiryDate = new Date();
      maxExpiryDate.setMonth(maxExpiryDate.getMonth() + 3);
      
      if (!expiresAt || new Date(expiresAt) > maxExpiryDate) {
        expiresAt = maxExpiryDate.toISOString();
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
      expires_at: expiresAt || null,
      max_uses: data.max_uses || null,
      notes: data.notes || null
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