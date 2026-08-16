/*
# IELTS PRO — Admin Panel Support: Subscriptions, Payments, Admin Access

## Overview
Adds subscription and payment tracking tables for premium user counting. Grants admin role
read access to all profiles, attempts, and results for the admin dashboard. Adds a SECURITY
DEFINER function for admin to change user roles safely.

## New Tables
1. **subscriptions** — Tracks user subscription tier (free/plus/pro) with billing period and status.
2. **payments** — Payment records linked to subscriptions with status and amount.

## Modified Tables
- **profiles**: Admin role gets SELECT on all profiles (for user management).
- **attempts**: Admin gets SELECT on all attempts (for analytics).
- **results**: Admin gets SELECT on all results (for analytics).
- **subscriptions**: Admin gets SELECT on all; user gets SELECT on own.
- **payments**: Admin gets SELECT on all; user gets SELECT on own.

## Security
- RLS on all new tables.
- Admin-only reads via role check against profiles table.
- SECURITY DEFINER function for role changes, EXECUTE revoked from anon.
- Column-level privilege: users cannot set their own role via UPDATE.
*/

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'plus', 'pro')),
  billing_period text CHECK (billing_period IN ('monthly', 'quarterly', 'half_yearly', 'yearly')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  amount integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_admin_subscriptions" ON subscriptions;
CREATE POLICY "select_admin_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'UZS',
  provider text DEFAULT 'manual' CHECK (provider IN ('click', 'payme', 'uzum', 'paynet', 'manual')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  provider_transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_admin_payments" ON payments;
CREATE POLICY "select_admin_payments" ON payments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admin read access to all profiles
DROP POLICY IF EXISTS "select_admin_profiles" ON profiles;
CREATE POLICY "select_admin_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles admin_p WHERE admin_p.id = auth.uid() AND admin_p.role = 'admin')
  );

-- Admin read access to all attempts
DROP POLICY IF EXISTS "select_admin_attempts" ON attempts;
CREATE POLICY "select_admin_attempts" ON attempts FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin read access to all results
DROP POLICY IF EXISTS "select_admin_results" ON results;
CREATE POLICY "select_admin_results" ON results FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin delete tests
DROP POLICY IF EXISTS "delete_tests_admin" ON tests;
CREATE POLICY "delete_tests_admin" ON tests FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- Admin delete sections
DROP POLICY IF EXISTS "delete_sections_admin" ON sections;
CREATE POLICY "delete_sections_admin" ON sections FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- Admin delete questions
DROP POLICY IF EXISTS "delete_questions_admin" ON questions;
CREATE POLICY "delete_questions_admin" ON questions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- Prevent users from updating their own role column
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, target_band, exam_date, avatar_url) ON profiles TO authenticated;

-- SECURITY DEFINER function for admin to change user roles
CREATE OR REPLACE FUNCTION admin_set_user_role(p_target_user uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_role NOT IN ('student', 'teacher', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE profiles SET role = p_role, updated_at = now() WHERE id = p_target_user;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_user_role FROM anon;
GRANT EXECUTE ON FUNCTION admin_set_user_role TO authenticated;

-- SECURITY DEFINER function for admin to update subscription tier
CREATE OR REPLACE FUNCTION admin_set_subscription_tier(p_target_user uuid, p_tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_tier NOT IN ('free', 'plus', 'pro') THEN
    RAISE EXCEPTION 'Invalid tier';
  END IF;

  INSERT INTO subscriptions (user_id, tier, status, started_at)
  VALUES (p_target_user, p_tier, 'active', now())
  ON CONFLICT (user_id)
  DO UPDATE SET tier = p_tier, status = 'active', updated_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_subscription_tier FROM anon;
GRANT EXECUTE ON FUNCTION admin_set_subscription_tier TO authenticated;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
