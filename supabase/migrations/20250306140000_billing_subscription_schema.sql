-- Billing & Subscription Management schema
-- Aligns with: plans, subscriptions, invoices, payment_methods, usage, audit_log, billing_metadata
-- Stripe integration: store stripe_customer_id on profiles; stripe_subscription_id, etc. on subscriptions.

-- Add Stripe customer ID to profiles (optional; for Stripe-backed billing)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Plans (reference data; can be seeded)
CREATE TABLE IF NOT EXISTS billing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,
  amount_monthly_cents INTEGER NOT NULL DEFAULT 0,
  amount_annual_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  features JSONB DEFAULT '[]',
  max_seats INTEGER,
  api_calls_quota INTEGER,
  entitlements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_plans_id ON billing_plans(id);

-- Subscriptions (per user; links to Stripe)
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL REFERENCES billing_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user ON billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_stripe ON billing_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Invoices (per user; synced from Stripe or generated)
CREATE TABLE IF NOT EXISTS billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  subscription_id UUID REFERENCES billing_subscriptions(id) ON DELETE SET NULL,
  amount_due_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')) DEFAULT 'open',
  due_date TIMESTAMPTZ,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  csv_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_user ON billing_invoices(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_invoices_stripe_id ON billing_invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_billing_invoices_stripe ON billing_invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_issued ON billing_invoices(issued_at DESC);

-- Payment methods (masked; Stripe stores full card)
CREATE TABLE IF NOT EXISTS billing_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT,
  brand TEXT,
  last4 TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_payment_methods_user ON billing_payment_methods(user_id);

-- Usage (per subscription / metric)
CREATE TABLE IF NOT EXISTS billing_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES billing_subscriptions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_usage_subscription ON billing_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_usage_metric ON billing_usage(metric_name);

-- Billing audit log (subscription changes, payment events)
CREATE TABLE IF NOT EXISTS billing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_audit_log_user ON billing_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_audit_log_created ON billing_audit_log(created_at DESC);

-- Billing metadata (key-value per user for downstream export)
CREATE TABLE IF NOT EXISTS billing_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);
CREATE INDEX IF NOT EXISTS idx_billing_metadata_user ON billing_metadata(user_id);

-- RLS
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_metadata ENABLE ROW LEVEL SECURITY;

-- Plans: read-only for authenticated
CREATE POLICY "Authenticated read billing_plans" ON billing_plans FOR SELECT TO authenticated USING (true);

-- Subscriptions: users manage own
CREATE POLICY "Users read own billing_subscriptions" ON billing_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own billing_subscriptions" ON billing_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own billing_subscriptions" ON billing_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Invoices: users read own
CREATE POLICY "Users read own billing_invoices" ON billing_invoices FOR SELECT USING (auth.uid() = user_id);

-- Payment methods: users manage own
CREATE POLICY "Users read own billing_payment_methods" ON billing_payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own billing_payment_methods" ON billing_payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own billing_payment_methods" ON billing_payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own billing_payment_methods" ON billing_payment_methods FOR DELETE USING (auth.uid() = user_id);

-- Usage: read via own subscription
CREATE POLICY "Users read own billing_usage" ON billing_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM billing_subscriptions s WHERE s.id = billing_usage.subscription_id AND s.user_id = auth.uid())
);

-- Audit log: users read own
CREATE POLICY "Users read own billing_audit_log" ON billing_audit_log FOR SELECT USING (auth.uid() = user_id);
-- Service role can insert (Edge Functions)
CREATE POLICY "Service role insert billing_audit_log" ON billing_audit_log FOR INSERT WITH CHECK (true);

-- Billing metadata: users manage own
CREATE POLICY "Users read own billing_metadata" ON billing_metadata FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own billing_metadata" ON billing_metadata FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own billing_metadata" ON billing_metadata FOR UPDATE USING (auth.uid() = user_id);

-- Seed default plans
INSERT INTO billing_plans (id, name, amount_monthly_cents, amount_annual_cents, currency, features, max_seats, api_calls_quota, entitlements) VALUES
  ('starter', 'Starter', 2900, 29000, 'usd', '["3 companies monitored", "1,000 API calls/month", "1 team seat"]', 1, 1000, ARRAY['Basic IPI access', 'Email support']),
  ('pro', 'Pro', 9900, 99000, 'usd', '["10 companies monitored", "5,000 API calls/month", "5 team seats"]', 5, 5000, ARRAY['Full IPI access', 'Priority support', 'Export reports']),
  ('enterprise', 'Enterprise', 29900, 299000, 'usd', '["Unlimited companies", "50,000 API calls/month", "20 team seats"]', 20, 50000, ARRAY['Full IPI access', 'Dedicated support', 'Custom integrations', 'SLA'])
ON CONFLICT (id) DO NOTHING;
