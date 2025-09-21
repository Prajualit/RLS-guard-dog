-- =============================================
-- SIMPLE RLS POLICIES FOR TESTING
-- These policies avoid infinite recursion by being very basic
-- =============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view relevant profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can view school profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."user_profiles";  
DROP POLICY IF EXISTS "Head teachers can create school users" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."user_profiles";

-- Simple policy 1: Users can view their own profile only
CREATE POLICY "view_own_profile"
ON "public"."user_profiles"
FOR SELECT
TO public
USING (auth.uid() = id);

-- Simple policy 2: Users can update their own profile only  
CREATE POLICY "update_own_profile"
ON "public"."user_profiles"
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Simple policy 3: Users can insert their own profile only
CREATE POLICY "insert_own_profile"
ON "public"."user_profiles"
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Simple policy 4: Allow delete for own profile (for cleanup)
CREATE POLICY "delete_own_profile"
ON "public"."user_profiles"
FOR DELETE
TO public
USING (auth.uid() = id);

-- Test query to verify policies work:
-- SELECT * FROM user_profiles WHERE id = auth.uid();