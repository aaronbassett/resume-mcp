import { supabase } from './supabase';
import { nanoid } from 'nanoid';
import type { ApiKey, CreateApiKeyData, UpdateApiKeyData, ApiKeyWithResume } from '../types/apiKeys';

// Generate a secure API key
const generateApiKey = (): string => {
  // Format: mcp_[random string]
  return `mcp_${nanoid(32)}`;
};

// Create a new API key
export const createApiKey = async (data: CreateApiKeyData): Promise<{ data: ApiKey | null; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const apiKey = generateApiKey();

    const keyData = {
      key: apiKey,
      user_id: user.id,
      resume_id: data.resume_id,
      name: data.name,
      is_admin: data.is_admin,
      expires_at: data.expires_at || null,
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