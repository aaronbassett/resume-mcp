export interface ApiKey {
  id: string;
  key?: string; // Full key - only available when first created
  key_first_chars?: string; // First 4 characters
  key_last_chars?: string; // Last 4 characters
  key_hash?: string; // Hashed key for verification
  user_id: string;
  resume_id: string;
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
}

export interface CreateApiKeyData {
  name: string;
  resume_id: string | null; // Null for admin keys
  is_admin: boolean;
  expires_at?: string | null;
  max_uses?: number | null;
  notes?: string;
}

export interface UpdateApiKeyData {
  name?: string;
  notes?: string;
  is_revoked?: boolean;
}

export interface ApiKeyWithResume extends ApiKey {
  resume: {
    title: string;
  } | null;
}