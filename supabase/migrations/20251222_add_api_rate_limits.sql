-- =====================================================
-- API RATE LIMITING SYSTEM
-- =====================================================

-- Create api_rate_limits table for tracking API usage
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL UNIQUE, -- api_key:hash, user:id, ip:address
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  request_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_api_rate_limits_identifier ON public.api_rate_limits(identifier);
CREATE INDEX idx_api_rate_limits_window_start ON public.api_rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage (edge functions use service role)
CREATE POLICY "Service role can manage api rate limits"
  ON public.api_rate_limits
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_api_rate_limits_updated_at
    BEFORE UPDATE ON public.api_rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old rate limit records (run daily)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $
BEGIN
  -- Delete records older than 24 hours
  DELETE FROM public.api_rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.api_rate_limits TO service_role;

-- Comments
COMMENT ON TABLE public.api_rate_limits IS 'Rate limiting tracking for API endpoints';
COMMENT ON COLUMN public.api_rate_limits.identifier IS 'Unique identifier: api_key:hash, user:id, or ip:address';
COMMENT ON COLUMN public.api_rate_limits.window_start IS 'Start of the rate limit window';
COMMENT ON COLUMN public.api_rate_limits.request_count IS 'Number of requests in current window';
COMMENT ON FUNCTION cleanup_old_rate_limits() IS 'Clean up rate limit records older than 24 hours';

-- =====================================================
-- API KEY EXPIRATION
-- =====================================================

-- Add expiration column to api_keys table
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for expiration queries
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON public.api_keys(expires_at);

-- Function to check if API key is valid (not expired)
CREATE OR REPLACE FUNCTION is_api_key_valid(key_hash TEXT)
RETURNS BOOLEAN AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.api_keys
    WHERE api_keys.key_hash = is_api_key_valid.key_hash
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old API keys (run daily)
CREATE OR REPLACE FUNCTION expire_old_api_keys()
RETURNS void AS $
BEGIN
  -- Deactivate expired keys
  UPDATE public.api_keys
  SET is_active = false
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW()
  AND is_active = true;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_api_key_valid(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION expire_old_api_keys() TO service_role;

-- Comments
COMMENT ON COLUMN public.api_keys.expires_at IS 'API key expiration date (NULL = never expires)';
COMMENT ON FUNCTION is_api_key_valid(TEXT) IS 'Check if API key is valid and not expired';
COMMENT ON FUNCTION expire_old_api_keys() IS 'Deactivate expired API keys';

-- =====================================================
-- AUDIT LOGGING SYSTEM
-- =====================================================

-- Create audit_logs table for security tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action VARCHAR(100),
  p_table_name VARCHAR(100),
  p_record_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS void AS $
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
GRANT EXECUTE ON FUNCTION log_admin_action(VARCHAR, VARCHAR, UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs() TO service_role;

-- Comments
COMMENT ON TABLE public.audit_logs IS 'Audit trail for security-sensitive actions';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed (e.g., UPDATE_PROFILE, APPROVE_PAYMENT)';
COMMENT ON COLUMN public.audit_logs.old_values IS 'Previous values before change';
COMMENT ON COLUMN public.audit_logs.new_values IS 'New values after change';
COMMENT ON FUNCTION log_admin_action(VARCHAR, VARCHAR, UUID, JSONB, JSONB) IS 'Log admin actions for audit trail';
COMMENT ON FUNCTION cleanup_old_audit_logs() IS 'Clean up audit logs older than 90 days';

-- =====================================================
-- TRIGGER FOR PAYMENT APPROVAL AUDIT
-- =====================================================

-- Trigger function to log payment approvals
CREATE OR REPLACE FUNCTION audit_payment_approval()
RETURNS TRIGGER AS $
BEGIN
  -- Only log when payment status changes to approved
  IF NEW.payment_status = 'approved' AND OLD.payment_status != 'approved' THEN
    PERFORM log_admin_action(
      'APPROVE_PAYMENT',
      'payments',
      NEW.id,
      jsonb_build_object(
        'payment_status', OLD.payment_status,
        'tokens_purchased', OLD.tokens_purchased
      ),
      jsonb_build_object(
        'payment_status', NEW.payment_status,
        'tokens_purchased', NEW.tokens_purchased,
        'verified_by', NEW.verified_by,
        'verified_at', NEW.verified_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS audit_payment_approval_trigger ON public.payments;
CREATE TRIGGER audit_payment_approval_trigger
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION audit_payment_approval();

-- =====================================================
-- TRIGGER FOR PROFILE UPDATE AUDIT
-- =====================================================

-- Trigger function to log profile updates by admins
CREATE OR REPLACE FUNCTION audit_profile_update()
RETURNS TRIGGER AS $
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if updater is admin
  SELECT profiles.is_admin INTO is_admin
  FROM public.profiles
  WHERE profiles.user_id = auth.uid();
  
  -- Only log if admin is updating someone else's profile
  IF is_admin AND NEW.user_id != auth.uid() THEN
    PERFORM log_admin_action(
      'UPDATE_PROFILE',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'subscription_plan', OLD.subscription_plan,
        'subscription_tokens', OLD.subscription_tokens,
        'purchased_tokens', OLD.purchased_tokens
      ),
      jsonb_build_object(
        'subscription_plan', NEW.subscription_plan,
        'subscription_tokens', NEW.subscription_tokens,
        'purchased_tokens', NEW.purchased_tokens
      )
    );
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS audit_profile_update_trigger ON public.profiles;
CREATE TRIGGER audit_profile_update_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_profile_update();

COMMENT ON FUNCTION audit_payment_approval() IS 'Audit trail for payment approvals';
COMMENT ON FUNCTION audit_profile_update() IS 'Audit trail for admin profile updates';
