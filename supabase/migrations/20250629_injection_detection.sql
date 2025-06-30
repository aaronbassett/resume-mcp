-- SpyKids Toy Secret Message System - Injection Detection Tables
-- Tables for tracking and detecting prompt injection attempts

-- Create table for API key injection detection settings
CREATE TABLE IF NOT EXISTS public.api_key_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  injection_detection_enabled BOOLEAN DEFAULT true,
  rate_limit_override INTEGER DEFAULT NULL,
  custom_wrapper_formats JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(api_key_id)
);

-- Create table for tracking injection transactions
CREATE TABLE IF NOT EXISTS public.injection_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes
CREATE INDEX idx_injection_transactions_lookup ON public.injection_transactions(transaction_id, api_key_id);
CREATE INDEX idx_injection_transactions_expires ON public.injection_transactions(expires_at);

-- Create table for captured injection attempts
CREATE TABLE IF NOT EXISTS public.injection_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  transaction_id TEXT,
  method TEXT NOT NULL,
  response_text TEXT NOT NULL,
  wrapper_type TEXT NOT NULL,
  confidence_score NUMERIC(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  captured_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Review fields
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  review_action TEXT CHECK (review_action IN ('verified', 'false_positive', 'needs_investigation')),
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  additional_context JSONB DEFAULT '{}'::jsonb
);

-- Create table for injection detection patterns
CREATE TABLE IF NOT EXISTS public.injection_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL UNIQUE,
  pattern_regex TEXT NOT NULL,
  pattern_description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence_modifier NUMERIC(3,2) DEFAULT 0.1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default injection patterns
INSERT INTO public.injection_patterns (pattern_name, pattern_regex, pattern_description, severity, confidence_modifier) VALUES
  ('acknowledge_transaction', 'acknowledge.*transaction', 'LLM acknowledging hidden transaction', 'high', 0.3),
  ('system_method', 'system:.*method', 'System directive with method reference', 'high', 0.3),
  ('reference_response', 'reference.*in.*response', 'Instruction to include reference', 'medium', 0.2),
  ('hidden_message', 'hidden.*message', 'Direct mention of hidden messages', 'critical', 0.4),
  ('injection_attempt', 'injection.*attempt', 'Direct mention of injection', 'critical', 0.4),
  ('base64_decode', 'base64.*decode', 'Reference to base64 decoding', 'medium', 0.2),
  ('transaction_brackets', '\[\[.*\]\]|\{\{.*\}\}', 'Common wrapper patterns', 'low', 0.1),
  ('verification_tags', 'verify:|data-ref|_tx:', 'Known verification tags', 'medium', 0.2)
ON CONFLICT (pattern_name) DO NOTHING;

-- Create function to clean up expired transactions
CREATE OR REPLACE FUNCTION public.cleanup_expired_injection_transactions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.injection_transactions
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get injection statistics
CREATE OR REPLACE FUNCTION public.get_injection_statistics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_captures BIGINT,
  high_confidence_captures BIGINT,
  verified_attempts BIGINT,
  false_positives BIGINT,
  unreviewed BIGINT,
  unique_api_keys BIGINT,
  unique_users BIGINT,
  avg_confidence_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_captures,
    COUNT(*) FILTER (WHERE confidence_score >= 0.8)::BIGINT as high_confidence_captures,
    COUNT(*) FILTER (WHERE review_action = 'verified')::BIGINT as verified_attempts,
    COUNT(*) FILTER (WHERE review_action = 'false_positive')::BIGINT as false_positives,
    COUNT(*) FILTER (WHERE NOT reviewed)::BIGINT as unreviewed,
    COUNT(DISTINCT api_key_id)::BIGINT as unique_api_keys,
    COUNT(DISTINCT user_id)::BIGINT as unique_users,
    AVG(confidence_score)::NUMERIC(3,2) as avg_confidence_score
  FROM public.injection_captures
  WHERE captured_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE public.api_key_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injection_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injection_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.injection_patterns ENABLE ROW LEVEL SECURITY;

-- RLS policies for api_key_settings
CREATE POLICY "Users can view own API key settings" ON public.api_key_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_key_settings.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own API key settings" ON public.api_key_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.api_keys 
      WHERE api_keys.id = api_key_settings.api_key_id 
      AND api_keys.user_id = auth.uid()
    )
  );

-- RLS policies for injection_captures (users can only see their own)
CREATE POLICY "Users can view own injection captures" ON public.injection_captures
  FOR SELECT USING (user_id = auth.uid());

-- Admin can view all captures
CREATE POLICY "Admins can view all injection captures" ON public.injection_captures
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = auth.uid()
      AND ak.permissions ? 'admin'
    )
  );

-- RLS policies for injection_patterns (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view patterns" ON public.injection_patterns
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can modify patterns
CREATE POLICY "Admins can manage patterns" ON public.injection_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.api_keys ak
      WHERE ak.user_id = auth.uid()
      AND ak.permissions ? 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_api_key_settings_api_key ON public.api_key_settings(api_key_id);
CREATE INDEX idx_injection_transactions_cleanup ON public.injection_transactions(expires_at);
CREATE INDEX idx_injection_captures_api_key ON public.injection_captures(api_key_id);
CREATE INDEX idx_injection_captures_user ON public.injection_captures(user_id);
CREATE INDEX idx_injection_captures_confidence ON public.injection_captures(confidence_score);
CREATE INDEX idx_injection_captures_reviewed ON public.injection_captures(reviewed);
CREATE INDEX idx_injection_captures_captured ON public.injection_captures(captured_at DESC);
CREATE INDEX idx_injection_captures_request ON public.injection_captures(request_id);
CREATE INDEX idx_injection_captures_transaction ON public.injection_captures(transaction_id) WHERE transaction_id IS NOT NULL;

-- Add comments
COMMENT ON TABLE public.api_key_settings IS 'Per-API key configuration for injection detection';
COMMENT ON TABLE public.injection_transactions IS 'Temporary storage for tracking injection detection transactions';
COMMENT ON TABLE public.injection_captures IS 'Captured potential injection attempts for review';
COMMENT ON TABLE public.injection_patterns IS 'Configurable patterns for detecting injection attempts';
COMMENT ON FUNCTION public.cleanup_expired_injection_transactions IS 'Removes expired injection transactions';
COMMENT ON FUNCTION public.get_injection_statistics IS 'Returns aggregated statistics for injection detection';