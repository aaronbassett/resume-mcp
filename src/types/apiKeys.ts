export interface ApiKey {
  id: string;
  key: string;
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
  resume_id: string;
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
  };
}