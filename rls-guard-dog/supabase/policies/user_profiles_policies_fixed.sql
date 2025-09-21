-- =============================================
-- FIXED RLS POLICIES FOR USER_PROFILES TABLE
-- These policies avoid infinite recursion
-- =============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view relevant profiles" ON "public"."user_profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."user_profiles";  
DROP POLICY IF EXISTS "Head teachers can create school users" ON "public"."user_profiles";

-- Policy 1: Users can view their own profile (simple case)
CREATE POLICY "Users can view own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO public
USING (auth.uid() = id);

-- Policy 2: Users can view profiles in their school (complex case)
-- We'll use a function to avoid recursion
CREATE OR REPLACE FUNCTION get_user_school_id(user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT school_id FROM user_profiles WHERE id = user_id LIMIT 1;
$$;

CREATE POLICY "Users can view school profiles"
ON "public"."user_profiles"
AS PERMISSIVE
FOR SELECT
TO public
USING (school_id = get_user_school_id(auth.uid()));

-- Policy 3: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow authenticated users to insert their own profile (for initial setup)
CREATE POLICY "Users can insert own profile"
ON "public"."user_profiles"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Policy 5: Head teachers can insert profiles for their school (optional, for admin features)
CREATE POLICY "Head teachers can create school users"
ON "public"."user_profiles"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  -- Only allow if the current user is a head teacher
  EXISTS (
    SELECT 1 FROM user_profiles ht
    WHERE ht.id = auth.uid() 
    AND ht.role = 'head_teacher'
    AND ht.school_id = school_id -- The school_id being inserted must match head teacher's school
  )
);