-- Analytics and Logging System
-- This migration creates comprehensive analytics and logging infrastructure

-- Create request logs table for MCP method tracking
CREATE TABLE IF NOT EXISTS public.request_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  request_id UUID NOT NULL,
  method TEXT NOT NULL,
  params JSONB,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  error_type TEXT,
  error_message TEXT,
  error_stack TEXT,
  ip_address INET NOT NULL,
  user_agent TEXT,
  referer TEXT,
  session_id UUID,
  trace_id UUID,
  span_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create analytics events table for user behavior tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'resume_viewed', 'resume_created', 'resume_updated', 'resume_deleted', 'resume_exported',
    'block_created', 'block_updated', 'block_deleted', 'block_reordered',
    'template_used', 'template_created', 'template_updated',
    'api_key_created', 'api_key_rotated', 'api_key_revoked',
    'search_performed', 'filter_applied', 'sort_changed',
    'ai_suggestion_generated', 'ai_suggestion_accepted', 'ai_suggestion_rejected'
  )),
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}'::jsonb,
  page_path TEXT,
  page_title TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile', 'api')),
  os_name TEXT,
  os_version TEXT,
  browser_name TEXT,
  browser_version TEXT,
  screen_resolution TEXT,
  viewport_size TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  cpu_usage_percent NUMERIC(5,2),
  memory_usage_mb INTEGER,
  database_time_ms INTEGER,
  external_api_time_ms INTEGER,
  cache_hit BOOLEAN DEFAULT false,
  cache_key TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  status_code INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create usage statistics table for aggregated metrics
CREATE TABLE IF NOT EXISTS public.usage_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('hour', 'day', 'week', 'month')),
  total_requests BIGINT DEFAULT 0,
  successful_requests BIGINT DEFAULT 0,
  failed_requests BIGINT DEFAULT 0,
  total_response_time_ms BIGINT DEFAULT 0,
  unique_methods JSONB DEFAULT '[]'::jsonb,
  method_breakdown JSONB DEFAULT '{}'::jsonb,
  error_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, api_key_id, period_start, period_type)
);

-- Create audit logs table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'user_created', 'user_updated', 'user_deleted', 'user_login', 'user_logout',
    'password_changed', 'email_changed', 'permission_granted', 'permission_revoked',
    'api_key_created', 'api_key_rotated', 'api_key_revoked', 'api_key_deleted',
    'resume_shared', 'resume_unshared', 'resume_exported', 'resume_imported',
    'template_published', 'template_unpublished',
    'admin_action', 'security_event', 'compliance_export'
  )),
  resource_type TEXT,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create search logs table for tracking search queries
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_type TEXT CHECK (query_type IN ('full_text', 'semantic', 'filter', 'combined')),
  filters JSONB,
  results_count INTEGER DEFAULT 0,
  results_returned INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  clicked_results JSONB DEFAULT '[]'::jsonb,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create error tracking table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_id UUID NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_context JSONB,
  request_data JSONB,
  user_actions TEXT[],
  browser_info JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create feature usage table
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_category TEXT,
  usage_count INTEGER DEFAULT 1,
  first_used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  total_time_spent_ms BIGINT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, feature_name)
);

-- Create functions for analytics

-- Function to log API request
CREATE OR REPLACE FUNCTION public.log_api_request(
  p_api_key_id UUID,
  p_method TEXT,
  p_params JSONB,
  p_response_status INTEGER,
  p_response_time_ms INTEGER,
  p_error_type TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT '0.0.0.0'::inet,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
  v_user_id UUID;
BEGIN
  v_request_id := gen_random_uuid();
  
  -- Get user_id from api_key
  SELECT user_id INTO v_user_id FROM public.api_keys WHERE id = p_api_key_id;
  
  -- Insert into request logs
  INSERT INTO public.request_logs (
    api_key_id, user_id, request_id, method, params,
    response_status, response_time_ms, error_type, error_message,
    ip_address, user_agent
  ) VALUES (
    p_api_key_id, v_user_id, v_request_id, p_method, p_params,
    p_response_status, p_response_time_ms, p_error_type, p_error_message,
    p_ip_address, p_user_agent
  );
  
  -- Update API usage logs (existing table)
  INSERT INTO public.api_usage_logs (
    api_key_id, request_id, method, resource, response_status,
    response_time_ms, error_type, error_message, ip_address, user_agent
  ) VALUES (
    p_api_key_id, v_request_id, p_method, 
    split_part(p_method, '_', 2), -- Extract resource from method name
    p_response_status, p_response_time_ms, p_error_type, p_error_message,
    p_ip_address, p_user_agent
  );
  
  -- Update usage statistics
  PERFORM public.update_usage_statistics(v_user_id, p_api_key_id, p_method, p_response_status);
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update usage statistics
CREATE OR REPLACE FUNCTION public.update_usage_statistics(
  p_user_id UUID,
  p_api_key_id UUID,
  p_method TEXT,
  p_status_code INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_is_success BOOLEAN;
BEGIN
  -- Determine period start for hourly stats
  v_period_start := date_trunc('hour', NOW());
  v_is_success := p_status_code >= 200 AND p_status_code < 300;
  
  -- Update hourly statistics
  INSERT INTO public.usage_statistics (
    user_id, api_key_id, period_start, period_end, period_type,
    total_requests, successful_requests, failed_requests,
    unique_methods, method_breakdown
  ) VALUES (
    p_user_id, p_api_key_id, v_period_start, v_period_start + INTERVAL '1 hour', 'hour',
    1, CASE WHEN v_is_success THEN 1 ELSE 0 END, CASE WHEN v_is_success THEN 0 ELSE 1 END,
    jsonb_build_array(p_method),
    jsonb_build_object(p_method, 1)
  )
  ON CONFLICT (user_id, api_key_id, period_start, period_type) DO UPDATE
  SET 
    total_requests = usage_statistics.total_requests + 1,
    successful_requests = usage_statistics.successful_requests + CASE WHEN v_is_success THEN 1 ELSE 0 END,
    failed_requests = usage_statistics.failed_requests + CASE WHEN v_is_success THEN 0 ELSE 1 END,
    unique_methods = CASE 
      WHEN usage_statistics.unique_methods ? p_method THEN usage_statistics.unique_methods
      ELSE usage_statistics.unique_methods || jsonb_build_array(p_method)
    END,
    method_breakdown = jsonb_set(
      usage_statistics.method_breakdown,
      ARRAY[p_method],
      to_jsonb(COALESCE((usage_statistics.method_breakdown->>p_method)::integer, 0) + 1)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track analytics event
CREATE OR REPLACE FUNCTION public.track_analytics_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_name TEXT,
  p_event_properties JSONB DEFAULT '{}'::jsonb,
  p_resume_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    user_id, resume_id, event_type, event_name, event_properties
  ) VALUES (
    p_user_id, p_resume_id, p_event_type, p_event_name, p_event_properties
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit event
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_risk_score INTEGER;
BEGIN
  -- Calculate risk score based on action
  v_risk_score := CASE
    WHEN p_action IN ('user_deleted', 'api_key_created', 'permission_granted') THEN 80
    WHEN p_action IN ('password_changed', 'email_changed', 'api_key_rotated') THEN 60
    WHEN p_action IN ('resume_shared', 'template_published') THEN 40
    ELSE 20
  END;
  
  INSERT INTO public.audit_logs (
    user_id, action, resource_type, resource_id,
    old_values, new_values, metadata, risk_score
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata, v_risk_score
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_request_logs_api_key ON public.request_logs(api_key_id);
CREATE INDEX idx_request_logs_user ON public.request_logs(user_id);
CREATE INDEX idx_request_logs_created ON public.request_logs(created_at);
CREATE INDEX idx_request_logs_method ON public.request_logs(method);
CREATE INDEX idx_request_logs_status ON public.request_logs(response_status);

CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_resume ON public.analytics_events(resume_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);

CREATE INDEX idx_performance_metrics_endpoint ON public.performance_metrics(endpoint, method);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX idx_performance_metrics_api_key ON public.performance_metrics(api_key_id);

CREATE INDEX idx_usage_statistics_user ON public.usage_statistics(user_id);
CREATE INDEX idx_usage_statistics_api_key ON public.usage_statistics(api_key_id);
CREATE INDEX idx_usage_statistics_period ON public.usage_statistics(period_start, period_type);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_risk ON public.audit_logs(risk_score) WHERE risk_score >= 60;

CREATE INDEX idx_search_logs_user ON public.search_logs(user_id);
CREATE INDEX idx_search_logs_query ON public.search_logs(query_text);
CREATE INDEX idx_search_logs_created ON public.search_logs(created_at);

CREATE INDEX idx_error_logs_user ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_type ON public.error_logs(error_type);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_unresolved ON public.error_logs(resolved) WHERE resolved = false;

CREATE INDEX idx_feature_usage_user ON public.feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature ON public.feature_usage(feature_name);

-- API Key Usage Tracking Table
CREATE TABLE public.api_key_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    is_successful BOOLEAN NOT NULL DEFAULT true,
    response_time_ms INTEGER,
    error_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for API key usage
CREATE INDEX idx_api_key_usage_created ON public.api_key_usage(created_at DESC);
CREATE INDEX idx_api_key_usage_key_method ON public.api_key_usage(api_key_id, method, created_at DESC);
CREATE INDEX idx_api_key_usage_success ON public.api_key_usage(api_key_id, is_successful);

-- Enable RLS on analytics tables
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for request logs
CREATE POLICY "Users can view own request logs" ON public.request_logs
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for analytics events
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for performance metrics (via API key)
CREATE POLICY "Users can view own performance metrics" ON public.performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = performance_metrics.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

-- RLS policies for usage statistics
CREATE POLICY "Users can view own usage statistics" ON public.usage_statistics
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for audit logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for search logs
CREATE POLICY "Users can view own search logs" ON public.search_logs
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for error logs
CREATE POLICY "Users can view own error logs" ON public.error_logs
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for feature usage
CREATE POLICY "Users can view own feature usage" ON public.feature_usage
  FOR SELECT USING (user_id = auth.uid());

-- RLS policies for API key usage
CREATE POLICY "Users can view own API key usage" ON public.api_key_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_key_usage.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

-- Create materialized view for analytics dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.analytics_dashboard AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT r.id) as total_resumes,
  COUNT(DISTINCT ak.id) as total_api_keys,
  COUNT(DISTINCT rl.request_id) as total_requests_30d,
  AVG(rl.response_time_ms) as avg_response_time_ms,
  COUNT(DISTINCT ae.session_id) as unique_sessions_30d,
  COUNT(CASE WHEN ae.event_type = 'ai_suggestion_accepted' THEN 1 END) as ai_suggestions_accepted,
  COUNT(CASE WHEN ae.event_type = 'ai_suggestion_generated' THEN 1 END) as ai_suggestions_generated,
  MAX(rl.created_at) as last_api_activity,
  MAX(ae.created_at) as last_event_activity
FROM public.users u
LEFT JOIN public.resumes r ON u.id = r.user_id
LEFT JOIN public.api_keys ak ON u.id = ak.user_id
LEFT JOIN public.request_logs rl ON u.id = rl.user_id 
  AND rl.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN public.analytics_events ae ON u.id = ae.user_id 
  AND ae.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_analytics_dashboard_user ON public.analytics_dashboard(user_id);

-- Create function to refresh analytics dashboard
CREATE OR REPLACE FUNCTION public.refresh_analytics_dashboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.analytics_dashboard;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.request_logs IS 'Detailed logs of all API requests';
COMMENT ON TABLE public.analytics_events IS 'User behavior and interaction tracking';
COMMENT ON TABLE public.performance_metrics IS 'System performance measurements';
COMMENT ON TABLE public.usage_statistics IS 'Aggregated usage metrics by time period';
COMMENT ON TABLE public.audit_logs IS 'Security and compliance audit trail';
COMMENT ON TABLE public.search_logs IS 'Search query tracking and optimization';
COMMENT ON TABLE public.error_logs IS 'Application error tracking and resolution';
COMMENT ON TABLE public.feature_usage IS 'Feature adoption and usage patterns';
COMMENT ON TABLE public.api_key_usage IS 'Granular API key usage tracking for billing and analytics';
COMMENT ON FUNCTION public.log_api_request IS 'Logs API request with automatic statistics update';
COMMENT ON FUNCTION public.track_analytics_event IS 'Records user analytics event';
COMMENT ON FUNCTION public.log_audit_event IS 'Creates audit log entry with risk scoring';
COMMENT ON MATERIALIZED VIEW public.analytics_dashboard IS 'Pre-aggregated analytics for dashboard performance';