export interface ApiKey {
  id: string;
  key?: string; // Full key - only available when first created
  key_first_chars?: string; // First 8 characters
  key_last_chars?: string; // Last 4 characters
  key_hash?: string; // Hashed key for verification
  user_id: string;
  resume_id: string | null;
  name: string;
  is_admin: boolean;
  expires_at: string | null;
  max_uses: number | null;
  created_at: string;
  first_used_at: string | null;
  last_used_at: string | null;
  use_count: number;
  unique_ips: number;
  notes: string | null;
  is_revoked: boolean;
  
  // Enhanced fields
  key_version: number;
  encryption_key_version: number;
  rotation_policy: 'never' | 'monthly' | 'quarterly' | 'yearly' | null;
  next_rotation_date: string | null;
  usage_count: number;
  last_error_at: string | null;
  metadata: Record<string, any>;
  ip_whitelist: string[] | null;
  user_agent_pattern: string | null;
  permissions: string[];
  rate_limit: number;
}

export interface CreateApiKeyData {
  name: string;
  resume_id: string | null; // Null for admin keys
  is_admin: boolean;
  expires_at?: string | null;
  max_uses?: number | null;
  notes?: string;
  
  // Enhanced fields
  rotation_policy?: 'never' | 'monthly' | 'quarterly' | 'yearly' | null;
  ip_whitelist?: string[];
  user_agent_pattern?: string;
  permissions?: string[];
  rate_limit?: number;
  metadata?: Record<string, any>;
}

export interface UpdateApiKeyData {
  name?: string;
  notes?: string;
  is_revoked?: boolean;
  
  // Enhanced fields
  rotation_policy?: 'never' | 'monthly' | 'quarterly' | 'yearly' | null;
  ip_whitelist?: string[];
  user_agent_pattern?: string;
  permissions?: string[];
  rate_limit?: number;
  metadata?: Record<string, any>;
  expires_at?: string | null;
  max_uses?: number | null;
}

export interface ApiKeyWithResume extends ApiKey {
  resume: {
    title: string;
  } | null;
}

export interface ApiKeyScope {
  id: string;
  name: string;
  description: string;
  resource_pattern: string;
  is_active: boolean;
}

export interface ApiKeyRotation {
  id: string;
  api_key_id: string;
  old_key_hash: string;
  new_key_hash: string;
  rotation_reason: 'scheduled' | 'manual' | 'security' | 'compromised';
  rotated_by: string | null;
  notification_sent: boolean;
  created_at: string;
}

export interface ApiUsageLog {
  id: string;
  api_key_id: string;
  request_id: string;
  method: string;
  resource: string;
  response_status: number;
  response_time_ms: number;
  request_size_bytes?: number;
  response_size_bytes?: number;
  error_type?: string;
  error_message?: string;
  ip_address: string;
  user_agent?: string;
  referer?: string;
  created_at: string;
}

export interface ApiKeyWebhook {
  id: string;
  user_id: string;
  webhook_url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
  updated_at: string;
}